import apiError from "../utils/apiError.js";
import { users } from "../models/users.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";

const login= asyncHandler(async (req, res)=> {

    const {username=undefined, email=undefined, password=undefined}=req.body;

    if((username===undefined || username==="") ||(email===undefined||email===""))
    {
        if(username===undefined || username==="" )
        {
            if(![email,password].every((prop)=>{ return prop!==undefined && prop.trim()!=="" }))
            {
                throw new apiError(`username or email field and password is required to login`, 400)
            }

                if(/\S+@\S+\.\S+/.test(email))
                {
                const user= await users.findOne({email});
            
                    if (!user) {throw new apiError(`could not find the user. kindly register first`, 404);}

                    if(await user.isPasswordCorrect(password)) 
                    {
                    const token=await user.generateToken()

                    res.status(200).json(new apiResponse(200, 'success-kindly check the access Token', token));
                
                    }else{ throw new apiError(`wrong password provided`, 400);}
                }else{
                    throw new apiError('e-mail contains @ symbol, Kindly check provided email', 400)
                }
           
            
        }
        else
        {
            if(![username,password].every((prop)=>{
                return prop!==undefined && prop.trim()!==""
            }))
            {
                throw new apiError(`username or email field and password is required to login`, 400);
            }
            const user = await users.findOne({username});
            
            if(!user) {throw new apiError(`could not find the user. Kindly register first`, 404)}
            console.log(await user.isPasswordCorrect(password));
            if (await user.isPasswordCorrect(password)){
                const token=await user.generateToken()

                res.status(200).json(new apiResponse(200, 'success-kindly check the access Token', token));
                
            }else{ throw new apiError(`wrong password provided`, 400); }

            


        }
        
    }
})

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
            
    

export {login};