import { asyncHandler } from "./asyncHandler.js"
import { users } from "../models/users.js";
import utils  from 'util';
import jwt from 'jsonwebtoken'
import apiError from "../utils/apiError.js";



const newAccessTokenMiddleware = asyncHandler(async (req,res,next)=>{

let token= req.headers.authorization || req.cookies?.refreshToken;
            
if(!token) throw new apiError('Token is required to access this route', 401);
            
console.log(token)
            
if(req.cookies?.refreshToken && token===req.cookies.refreshToken){
            
        token=req.cookies.refreshToken
                
              
        let jwtVerify= utils.promisify(jwt.verify);
        const decoded= await jwtVerify(token, process.env.JWT_REFRESHTOKEN_SECRET);
        const user= await users.findById(decoded.id)

/*keep in mind that express automatically will throw jwt expiry error if 
decoded doesn't exist so no need for one more conditional check for this. */

        if(!user.refreshtoken) throw new apiError('User had logged-out, Kindly login again', 401);
           
        const RefreshTokenV= await client.get('user:token:refresh');
           
        if(decoded.__v !== RefreshTokenV) throw new apiError('This Refresh-Token is Invalid', 401)
               
                
        if(user.passwordChangedAt){

            const passwordchangedtimeMILLISECONDS=parseInt(user.passwordChangedAt.getTime()/1000);
            const jwtTimestamp= decoded.iat //the decoded.iat is 10 digits so divided the above by /1000
                
            console.log(passwordchangedtimeMILLISECONDS)
            console.log(jwtTimestamp)
            let response= passwordchangedtimeMILLISECONDS > jwtTimestamp
        
            //Somehow the method made in the userschema for this wasn't working so wrote the logic here.
        
            if(response) throw new apiError('Password has been recently changed. Kindly Login Again', 401)
        
        }
                
            
        if(decoded && user){

                req.user=decoded;
                return next()
        }
        
};
            
            
if (req.headers.authorization && token===req.headers.authorization){

    token=req.headers.authorization
    
        if(token.startsWith('bearer') || token.startsWith('Bearer')){
            token= token.split(' ')[1];
    
                let jwtVerify= utils.promisify(jwt.verify);
                const decoded= await jwtVerify(token, process.env.JWT_REFRESHTOKEN_SECRET);
                const user= await users.findById(decoded.id);

                if(!user.refreshtoken) throw new apiError('User had logged-out, Kindly login again', 401);

                if(decoded.__v !== req.session.refresh) throw new apiError('Invalid Refresh-Token or Refresh-Token has expired',401)
                        
                if(user.passwordChangedAt){

                    const passwordchangedtimeMILLISECONDS=parseInt(user.passwordChangedAt.getTime()/1000);
                    const jwtTimestamp= decoded.iat //the decoded.iat is 10 digits so divided the above by /1000
                        
                    console.log(passwordchangedtimeMILLISECONDS)
                    console.log(jwtTimestamp)
                    let response= passwordchangedtimeMILLISECONDS > jwtTimestamp
                
                    //Somehow the method made in the userschema for this wasn't working so wrote the logic here.
                
                    if(response) throw new apiError('Password has been recently changed. Kindly Login Again', 401)
                
                }
                
                if(decoded && user){

                            req.user=decoded;
                            return next()
                }
                  
        }else{
                    
            throw new apiError('A Bearer-Token is required to access this route', 401)
        }    
}
        
});


export {newAccessTokenMiddleware};