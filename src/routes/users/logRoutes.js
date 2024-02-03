import { Router } from "express";
import {login,logout, handleSocialLogin} from '../../controllers/users/logController.js'
import { emailSymbolChecker } from "../../middlewares/users/emailsymbolChecker.js";
import { verifyJWT } from "../../middlewares/users/authorization.js";
import passport from "passport";

const route= Router();



route.route('/login').post(emailSymbolChecker, login);
route.route('/logout').post(verifyJWT ,logout);

//Social Login 1.GOOGLE
route.route('/auth/google').get(passport.authenticate('google',{scope:['profile','email']}));
route.route('/auth/google/callback').get(passport.authenticate('google',{session:false, 
                                        failureRedirect:'/passportLoginFailure'}), handleSocialLogin);
/*******************************************************************************************/


export default route;