import { port } from "../../../server.js";
import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js"
import { users } from "../../models/users.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import { sendEmailVerifyEmail } from "../../utils/nodemailer.js";
import crypto from 'crypto'




const emailVerifyRequest= asyncHandler( async (req,res)=>{

const user = await users.findById(req.user?._id);

if(!user) throw new apiError('unauthorized request', 401);

if(user.isEmailVerified) throw new apiError('Email is already verified', 400);
    
const token=  await user.generateEmailVerifyTokens();
   
if(!token) throw new apiError('Something went wrong. Try again later')      

user.save({validateBeforeSave:false})

const name= `${user?.firstname} ${user?.lastname?user.lastname:""}`
const email= user?.email
const link= `${req.protocol}://${req.hostname}:${port}/api/v1/users/emailVerificationProcess/${token}`


try {

    await sendEmailVerifyEmail(name, email, link);
    res.status(200).json(new apiResponse(200,'An email verification link has been sent to the registered email'))

} catch (error) {
    user.emailVerificationToken=undefined;
    user.emailVerificationTokenExpiry=undefined;
    console.log(error)
    throw new apiError('Something went wrong while sending email verification mail. Please try again later',500)
    
}

});

const emailVerificationProcess= asyncHandler( async (req,res)=>{


const {token} = req.params;

if(!token) throw new apiError('Need Email Verification Token to access this route', 401);


const encryptedToken= crypto.createHash('sha256').update(token).digest('hex');
// console.log(encryptedToken);
const user =await users.findOne({emailVerificationToken:encryptedToken});

// console.log(user)
if(!user) throw new apiError('Email Verification token is invalid. Kindly Check your token.', 400);

//Both of these are returing 13 digits by default -~ but decoded.iat returns 10 digits by default so have to act acordingly
if (parseInt(user.emailVerificationTokenExpiry.getTime()) < Date.now()) {
    // console.log(parseInt(user.passwordChangeTokenExpiry.getTime()));
    console.log(Date.now())

    user.emailVerificationToken=undefined;
    user.emailVerificationTokenExpiry=undefined;
    await user.save({validateBeforeSave:false});

    throw new apiError('Email verification link has expired. Try again.', 401);
}

const updateduser =await users.findOneAndUpdate({emailVerificationToken:encryptedToken},
                                                {
                                                  
                                                  $set: {isEmailVerified:true},
                                                  $unset:{
                                                         emailVerificationToken:"",
                                                         emailVerificationTokenExpiry:""
                                                        }
                                                },
                                                {new:true}
                                                );

if(!updateduser) throw new apiError('Something went wrong while verifying email. Please try again later.',500)                                                


res.status(200).json(new apiResponse(200, 'Email Verification is done'))

});


export {emailVerifyRequest, emailVerificationProcess}