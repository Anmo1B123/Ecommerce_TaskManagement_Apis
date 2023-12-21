import { port } from "../../server.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { users } from "../models/users.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { sendEmail } from "../utils/nodemailer.js";
import crypto from "crypto"



export const passwordForgot=asyncHandler(async function(req,res){

const {email=undefined}= req.body
if(!email) throw new apiError('Email is required to reset the password', 400);
const user = await users.findOne({email});

if (!user) throw new apiError('User by this e-mail does not exist', 400);

const token = user.generatePasswordResetToken();
await user.save({validateBeforeSave:false})

const pswdResetRoute= `${req.protocol}://${req.hostname}:${port}/api/v1/users/passwordReset/${token}`

const message= `A password reset link has been sent as requested.\n ${pswdResetRoute} \n which will be valid for next 10 minutes`

const emailbody= {
    email,
    subject: 'Password Reset',
    message
}

try {
    await sendEmail(emailbody);
    res.status(200).json(new apiResponse(200, 'A password reset link is sent to the registered email-id. Please Check'));

} catch (error) {

    user.passwordChangeToken=undefined;
    user.passwordChangeTokenExpiry=undefined;
    await user.save({validateBeforeSave:false});
    console.log(error)
    throw new apiError('Something went wrong while reseting the password. Please try again later...', 500);
    
}



});


export const passwordReset=asyncHandler(async function(req,res){

const {token=undefined}= req.params;
if (!token) throw new apiError('Need password reset token to access this route', 403);

const encryptedToken= crypto.createHash('sha256').update(token).digest('hex');
console.log(encryptedToken);
const user =await users.findOne({passwordChangeToken:encryptedToken});



console.log(user)
if(!user) throw new apiError('Password reset token is invalid. Kindly Check your token.', 400);

//Both of these are returing 13 digits by default -~ but decoded.iat returns 10 digits by default so have to act acordingly
if (parseInt(user.passwordChangeTokenExpiry.getTime()) < Date.now()) {
    console.log(parseInt(user.passwordChangeTokenExpiry.getTime()));
    console.log(Date.now())

    user.passwordChangeToken=undefined;
    user.passwordChangeTokenExpiry=undefined;
    await user.save({validateBeforeSave:false});
    throw new apiError('Password link has expired. Try Reseting the password again..', 401);
}
//*******************************Handling the updation of password. ******************************************

const {password, confirmPassword} = req.body || {password:undefined, confirmPassword:undefined}

    console.log(password, confirmPassword)
    if([password, confirmPassword].some((fields)=>{ return fields ===undefined || fields===""})){ 
    
    throw new apiError('Password and confirm password field is required to proceed further', 400);
    };

if (password!==confirmPassword)throw new apiError('Password and confirm password is not same',400);

user.password=password;
user.passwordChangedAt=Date.now();
user.passwordChangeToken=undefined;
user.passwordChangeTokenExpiry=undefined;
user.refreshtoken=undefined; /*undefining the refresh token, it's unique version, access token's unique version
                             saved in user schema due to password change.*/
user.uniqueVersionAccess=undefined;
user.uniqueVersionRefresh=undefined;

await user.save({validateBeforeSave:false});

/* CLEARING THE COOKIES AS WELL */
res.clearCookie('accessToken');
res.clearCookie('refreshToken');

// req.session.access=undefined; // undefining both access and refresh t jwt's unique versions in req.session object.
// req.session.refresh=undefined;


res.status(200).json(new apiResponse(200, 'Password Changed Successfully'));

});