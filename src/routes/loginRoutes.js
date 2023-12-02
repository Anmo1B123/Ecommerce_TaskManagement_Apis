import { Router } from "express";
import {login} from '../controllers/loginController.js'
const route= Router();



route.post('/', login);

export default route;