import utils  from 'util';
import jwt from 'jsonwebtoken'
import { asyncHandler } from '../Handlers/asyncHandler.js';
import { users } from '../../models/users.js';
import apiError from '../../utils/apiError.js';
import { client } from '../../database/redis.js';

 const verifyJWT = asyncHandler ( async (req,res,next)=>{
 
    let token= req.headers.authorization || req.cookies?.accessToken || "";

if(!token) throw new apiError('unauthorized request', 401);
    // console.log(token)

/*CONDITION FOR TOKEN IN COOKIE */
if((req.cookies?.accessToken ||false) && token===req.cookies.accessToken)
{
    console.log('I am working')
    token=req.cookies.accessToken
}  

/*CONDITION FOR TOKEN IN HEADER~BEARER */
if (req.headers.authorization && token===req.headers.authorization)
{
    token=req.headers.authorization
    if(token.startsWith('bearer') || token.startsWith('Bearer'))
    {
        token= token.split(' ')[1];
        // console.log('hi')
    }
    else
    {
        throw new apiError('A Bearer-Token is required to access this route', 401)
    }
}
        

        const jwtVerify= utils.promisify(jwt.verify);
        const decoded= await jwtVerify(token, process.env.JWT_SECRET);
        
        const user= await users.findById(decoded?._id).select('-password');

        if(!user.refreshtoken) throw new apiError('User had logged-out, Kindly login again', 401);
        
        const uniqueVersionAccess= user.uniqueVersionAccess?user.uniqueVersionAccess:undefined;

        if(decoded.__v !== uniqueVersionAccess) throw new apiError('This Token is Inavlid', 401);
        
        if(user.passwordChangedAt)
        {
                const passwordchangedtimeMILLISECONDS=parseInt(user.passwordChangedAt.getTime()/1000);
                const jwtTimestamp= decoded.iat //the decoded.iat is 10 digits so divided the above by /1000
        
                // console.log(passwordchangedtimeMILLISECONDS)
                // console.log(jwtTimestamp)
                let response= passwordchangedtimeMILLISECONDS > jwtTimestamp

                //Somehow the method made in the userschema for this wasn't working so wrote the logic here.

                if( response) throw new apiError('Password has been recently changed. Kindly Login Again', 401)

        }
        
        if(decoded && user){
        req.user=user;
        return next()
        }else{
            throw new apiError('invalid access token', 401)
        }
});


const ifAdmin= (role)=>{

return asyncHandler( async (req,res,next)=>{
        

        const user= await users.findById(req.user.id)
        console.log(user.role)
    
        if(user.role==='admin') next()
        else{
        throw new apiError('you are not authorized to visit this route', 403)
        }
        
    
});
};

export {verifyJWT, ifAdmin};