import { Router } from "express";
import { verifyJWT } from "../../middlewares/users/authorization.js";


const route = Router();


route.use(verifyJWT);

route.route('/coupon').get().post()


export default route;