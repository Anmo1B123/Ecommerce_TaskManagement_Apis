import { asyncHandler } from "../middlewares/asyncHandler.js"
import { users } from "../models/users.js";
import utils  from 'util';
import jwt from 'jsonwebtoken'
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { client } from "../database/redis.js";


export const newAccessToken= asyncHandler(async (req,res, next)=>{

const user= await users.findById(req.user.id)    
if(!user) throw new apiError('Invalid Refresh-Token', 401);


try {
    const result= await user.generateToken();
    const {accessToken, uniqueV1}=result;

    await client.set('user:token:access', uniqueV1);
    // req.session.access=uniqueV1; //updating the session.access property with new unique-version of access-token.
    res.setHeader('Set-cookie', `accessToken=${accessToken}; Path=/; HttpOnly; Secure`)
    res.status(200).json(new apiResponse(201, 'A new access-token has been sent',accessToken))
} catch (error) {
    throw new apiError('Could not complete the request. Try again later', 500)
}

});