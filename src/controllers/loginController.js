import apiError from "../utils/apiError.js";
import { users } from "../models/users.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";

const login= asyncHandler(async (req, res)=> {

    let keysOfRequestBodyObject =Object.keys(req.body);
    console.log(keysOfRequestBodyObject)
    let username, email, password; 
    console.log(keysOfRequestBodyObject.map((keyName)=>{
        // {keyName} = req.body
    }))
    res.send('done wait pls');

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
            
    
})

export {login};