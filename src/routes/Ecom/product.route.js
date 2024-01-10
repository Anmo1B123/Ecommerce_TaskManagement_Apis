import { Router } from "express";
import { verifyJWT } from "../../middlewares/users/authorization.js";



const route = Router();


route.route('/product')


export default route;