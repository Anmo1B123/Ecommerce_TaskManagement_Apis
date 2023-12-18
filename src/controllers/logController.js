import apiError from "../utils/apiError.js";
import { users } from "../models/users.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import bcrypt from 'bcrypt'
import { client } from "../database/redis.js";

const login= asyncHandler(async (req, res)=> {

    const {username=undefined, email=undefined, password=undefined}=req.body;

    if(((username===undefined || username.trim()==="") && (email===undefined || email==="")) || password===undefined || password==="") throw new apiError('username or email and a password is required to login', 400);

    const userFound = await users.findOne({$or:[{username},{email}]});
    if (!userFound) throw new apiError('user does not exist by these credentials. Kindly register first', 404);
    
       
       
        if (! await userFound.isPasswordCorrect(password)){
                                         
        throw new apiError('wrong password', 400)
    };

       const accessTokenResult1 =await userFound.generateToken();
       const refreshTokenResult2=await userFound.generateRefreshToken();

       const {accessToken, uniqueV1}= accessTokenResult1;
       const {refreshToken, uniqueV2}= refreshTokenResult2;

    //    req.session.access=uniqueV1;
    //    req.session.refresh=uniqueV2;
    //    console.log(req.session);
    //Saving the unique versions of both tokens in the req.session object.

    /* Saving the unique version in REDIS */

    client.set('user:token:access', uniqueV1).then(()=>console.log('Access Token Version is saved in Redis'))
                                            .catch((err)=>console.log(err));

    client.set('user:token:refresh', uniqueV2).then(()=>console.log('Refresh Token Version is saved in Redis'))
                                            .catch((err)=>console.log(err));
       
    res.setHeader('Set-cookie', [`accessToken=${accessToken}; Path=/; HttpOnly;`, `refreshToken=${refreshToken}; Path=/; HttpOnly;`])
    res.status(200).json(new apiResponse(200, 'success-kindly check the Token', {accessToken, refreshToken}));

    

    // if((username===undefined || username==="") ||(email===undefined||email===""))
    // {
    //     if(username===undefined || username==="" )
    //     {
    //         if(![email,password].every((prop)=>{ return prop!==undefined && prop.trim()!=="" }))
    //         {
    //             throw new apiError(`username or email field and password is required to login`, 400)
    //         }

               
    //             const user= await users.findOne({email});
            
    //                 if (!user) {throw new apiError(`could not find the user. kindly register first`, 404);}

    //                 if(await user.isPasswordCorrect(password)) 
    //                 {
    //                 const token=await user.generateToken()

    //                 res.status(200).json(new apiResponse(200, 'success-kindly check the access Token', token));
                
    //                 }else{ throw new apiError(`wrong password provided`, 400);}
                
           
            
    //     }
    //     else
    //     {
    //         if(![username,password].every((prop)=>{
    //             return prop!==undefined && prop.trim()!==""
    //         }))
    //         {
    //             throw new apiError(`username or email field and password is required to login`, 400);
    //         }
    //         const user = await users.findOne({username});
            
    //         if(!user) {throw new apiError(`could not find the user. Kindly register first`, 404)}
    //         console.log(await user.isPasswordCorrect(password));
    //         if (await user.isPasswordCorrect(password)){
    //             const token=await user.generateToken()

    //             res.status(200).json(new apiResponse(200, 'success-kindly check the access Token', token));
                
    //         }else{ throw new apiError(`wrong password provided`, 400); }

            


    //     }
        
    // }
});

// console.log(keysOfRequestBodyObject)
// let keysObject = {} 
// console.log(keysOfRequestBodyObject.map((keyName)=>{
//     if(!req.body.keyname===undefined){

//     }
/*{keysOfRequestBodyObject} (req.body);

const {username, email, password}= req.body || {username:undefined, email:undefined,password:undefined}

    if(username!==undefined || username!=="")
    {
        [username, password]
    }
        
    if( ![username, email, password].every((prop)=>{ return prop!== undefined && prop.trim()!==""}))  
    {
        throw new apiError('fields are required', 400);
    }

else{
        const user= await users.findone({$or:[{username},{email}]});
        if(!user){
                    throw new apiError('Could not find the user', 404);
        }
        else{ 

            if(!user.isPasswordCorrect(password))
            {
                throw new apiError(`wrong password`, 400);
            }
            
            const token = user.generateToken();
            res.status(200).json(new apiResponse(200, 'success', token))

        }

    }
       */
            
const logout=asyncHandler(async (req,res)=>{

    const user = await users.findById(req.user.id)
    if(!user) throw new apiError('unauthorized request',401)

    // req.session.access=undefined;
    // req.session.refresh=undefined;

    await client.del('user:token:access')
    await client.del('user:token:refresh')
    
    user.refreshtoken=undefined;
    await user.save({validateBeforeSave:false})

    res.status(200).json(new apiResponse(200,'Successfully Logged-out'))

});

export {login,logout};