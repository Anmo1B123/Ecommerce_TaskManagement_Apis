import {Router} from 'express'
import {passwordForgot, passwordReset} from '../controllers/passwordChangeController.js'
import { protect } from '../middlewares/authorization.js';
import { emailSymbolChecker } from '../middlewares/emailsymbolChecker.js';
const route = Router();

route.route('/passwordForgot').post(emailSymbolChecker,passwordForgot);
route.route('/passwordReset/:token').patch(passwordReset);


export default route;