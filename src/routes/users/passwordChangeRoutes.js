import {Router} from 'express'
import {passwordForgot, passwordReset} from '../../controllers/users/passwordChangeController.js'
import { verifyJWT } from '../../middlewares/users/authorization.js';
import { emailSymbolChecker } from '../../middlewares/users/emailsymbolChecker.js';
const route = Router();

route.route('/passwordForgot').post(emailSymbolChecker,passwordForgot);
route.route('/passwordReset/:token').patch(passwordReset);


export default route;