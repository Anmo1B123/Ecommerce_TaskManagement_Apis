import utils  from 'util';
import jwt from 'jsonwebtoken'
import { asyncHandler } from './asyncHandler.js';
import { users } from '../models/users.js';
import apiError from '../utils/apiError.js';
import { client } from '../database/redis.js';

 const protect = asyncHandler ( async (req,res,next)=>{
 
    let token= req.headers.authorization || req.cookies?.accessToken;

    if(!token) throw new apiError('unauthorized request', 401);
    console.log(token)

    if(req.cookies?.accessToken && token===req.cookies.accessToken){

        token=req.cookies.accessToken
        
        const decoded= jwt.verify(token, process.env.JWT_SECRET);

       const AccessTokenV= await client.get('user:token:access')

        if(decoded.__v !== AccessTokenV) throw new apiError('This Token is Inavlid', 401);
        
        const user= await users.findById(decoded.id);

        if(!user) throw new apiError('Token was expired', 401);

        if(user)
        {


            if(user.passwordChangedAt){
                const passwordchangedtimeMILLISECONDS=parseInt(user.passwordChangedAt.getTime()/1000);
                const jwtTimestamp= decoded.iat //the decoded.iat is 10 digits so divided the above by /1000
        
                console.log(passwordchangedtimeMILLISECONDS)
                console.log(jwtTimestamp)
                let response= passwordchangedtimeMILLISECONDS > jwtTimestamp

                //Somehow the method made in the userschema for this wasn't working so wrote the logic here.

                if( response) throw new apiError('Password has been recently changed. Kindly Login Again', 401)

            }
        }

        if(decoded && user){
        req.user=decoded;
        return next()
        }else{
            throw new apiError('invalid access token', 401)
        }

    }



    if (req.headers.authorization && token===req.headers.authorization){
        token=req.headers.authorization
        if(token.startsWith('bearer') || token.startsWith('Bearer')){

        token= token.split(' ')[1];
            console.log('hi')
        let jwtVerify= utils.promisify(jwt.verify);

        const decoded= await jwtVerify(token, process.env.JWT_SECRET);
        
        
        const user= await users.findById(decoded.id);

        if(!user) throw new apiError('Token was expired', 401);
        
        if(user)
        {


            if(user.passwordChangedAt){
                const passwordchangedtimeMILLISECONDS=parseInt(user.passwordChangedAt.getTime()/1000);
                const jwtTimestamp= decoded.iat //the decoded.iat is 10 digits so divided the above by /1000
        
                console.log(passwordchangedtimeMILLISECONDS)
                console.log(jwtTimestamp)
                let response= passwordchangedtimeMILLISECONDS > jwtTimestamp

                //Somehow the method made in the userschema for this wasn't working so wrote the logic here.

                if( response) throw new apiError('Password has been recently changed. Kindly Login Again', 401)

            }
        } 
        const AccessTokenV= await client.get('user:token:access')
        if(decoded.__v !== AccessTokenV) throw new apiError('This token is invalid', 401);

        if(decoded && user){
        req.user=decoded;
        return next()
        }else{
            throw new apiError('invalid access token', 401)
        }
        }else{
            
            throw new apiError('An unauthorized request', 401);
        }
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
        
    
    })
};

export {protect, ifAdmin};