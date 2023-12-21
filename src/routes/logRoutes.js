import { Router } from "express";
import {login,logout} from '../controllers/logController.js'
import { emailSymbolChecker } from "../middlewares/emailsymbolChecker.js";
import { protect } from "../middlewares/authorization.js";
const route= Router();



route.post('/login', emailSymbolChecker, login);
route.post('/logout',protect ,logout);

export default route;