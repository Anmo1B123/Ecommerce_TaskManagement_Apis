import { Router } from "express";

// IMPORTING CONTROLLERS
import {getAllUsers,createNewUser,getUser,updateUser,deleteUser, 
        getCurrentUser, updatePassword, updateAvatar, 
        updateCoverImage, deleteCoverImage} from '../../controllers/users/userControllers.js';
import { emailVerifyRequest, emailVerificationProcess} from "../../controllers/users/emailVerify.js";
import {login,logout, handleSocialLogin} from '../../controllers/users/logController.js'
import { newAccessToken } from "../../controllers/users/newAccessTokenGeneration.js";
import {passwordForgot, passwordReset} from '../../controllers/users/passwordChangeController.js'

// IMPORTING REQUIRED MIDDLEWARES 
import {upload} from '../../middlewares/fileHandlers/multer.js';
import { emailSymbolChecker } from "../../middlewares/users/emailsymbolChecker.js";
import { ifAdmin, verifyJWT } from "../../middlewares/users/authorization.js";
import { newAccessTokenVerifyRefreshToken } from "../../middlewares/users/newAccessTokenMiddle.js";
import passport from "passport";




const route= Router();


// BASIC USER OPERATIONS

route.route('/').get(getAllUsers).post(upload.fields([{name: 'avatar', maxCount: 1},
                                                      {name: 'coverimage', maxCount: 1}
                                                      ]),createNewUser);

/*although upload/multer methods are being used but even if user does not upload any file on 
frontend/multipart-form using postman/thunderClient no error shall come. And req.body data can 
be accessed thru multipart-form only when multermiddleware is in use before the route. */


//------------------------------------------------------------------------------------------------------//

// CURRENT AUTHORIZED USER
route.route('/currentUser').get(verifyJWT, getCurrentUser)
//-----------------------------------------------------------------------------------------------------

// LOGIN-LOGOUT
route.route('/login').post(emailSymbolChecker, login);
route.route('/logout').post(verifyJWT ,logout);

/*Social Login 1.GOOGLE*/   //    ~PASSPORT-GOOGLE~
route.route('/auth/google').get(passport.authenticate('google',{scope:['profile','email']}));
route.route('/auth/google/callback').get(passport.authenticate('google'), handleSocialLogin);
//-----------------------------------------------------------------------------------------------------

// UPDATE PASSWORD-AVATAR-COVERIMAGE, DELETE COVERIMAGE
route.route('/updatePassword').patch(verifyJWT, updatePassword);
route.route('/updateAvatar').patch(verifyJWT, upload.single('avatar'), updateAvatar);
route.route('/updateCoverImage').patch(verifyJWT, upload.single('coverimage'), updateCoverImage);
route.route('/deleteCoverImage').delete(verifyJWT, deleteCoverImage);
//-----------------------------------------------------------------------------------------------------

// EMAIL-VERIFICATION
route.route('/emailVerifyRequest').post(verifyJWT,emailVerifyRequest);
route.route('/emailVerificationProcess/:token').patch(verifyJWT,emailVerificationProcess);
//MAYBE HAVE TO REMOVE VERIFYJWT FROM THE ABOVE ROUTE AND ATTACH THE TOKEN IN QUERY PARAM (AS PER NEED)
//------------------------------------------------------------------------------------------------------

// NEW ACCESS-TOKEN
route.route('/new_accessToken').get(newAccessTokenVerifyRefreshToken, newAccessToken);
//-----------------------------------------------------------------------------------------------------

// PASSWORD FORGOT-RESET
route.route('/passwordForgot').post(emailSymbolChecker,passwordForgot);
route.route('/passwordReset/:token').patch(passwordReset);
//-----------------------------------------------------------------------------------------------------

route.route('/:id').get(verifyJWT,getUser)
                    .patch(upload.fields([
                                          {name: 'avatar', maxCount: 1},
                                          {name: 'coverimage', maxCount: 1}
                                          ]),emailSymbolChecker,updateUser)
                    .delete(verifyJWT,ifAdmin('admin'),deleteUser);

export default route;                 