import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js"
import { users } from "../../models/users.js";
import utils  from 'util';
import jwt from 'jsonwebtoken'
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import { client } from "../../database/redis.js";


export const newAccessToken= asyncHandler(async (req,res,next)=>{

const user= await users.findById(req.user._id)    
if(!user) throw new apiError('Invalid Refresh-Token', 401);


try {
    const result= await user.generateToken();
    const {accessToken, uniqueV1}=result;

    await user.save({validateBeforeSave:false});

    // await client.set('user:token:access', uniqueV1);
    // req.session.access=uniqueV1; //updating the session.access property with new unique-version of access-token.
    
    //OVERWRITING THE ACCESSTOKEN COOKIE VALUE WITH THE NEW ACCESSTOKEN//
    const oneDaySeconds= 24*60*60
    res.setHeader('Set-cookie', `accessToken=${accessToken}; Max-Age=${oneDaySeconds}; Path=/; HttpOnly; Secure`)
    
    //SENDING THE NEW ACCESS TOKEN IN RESPONSE AS WELL//
    res.status(200).json(new apiResponse(201, 'A new access-token has been sent',accessToken))
} catch (error) {
    next(error);
}

});