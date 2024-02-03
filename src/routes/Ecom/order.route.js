import { Router } from "express";
import { verifyJWT } from "../../middlewares/users/authorization.js";


const route = Router();


route.use(verifyJWT);

route.route('/order').get().post()


export default route;