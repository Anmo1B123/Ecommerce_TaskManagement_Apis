import { Router } from "express";
import {getMyEcomProfile, updateEcomProfile, getMyOrders } from "../../controllers/Ecom/profile.controller.js";
import { verifyJWT } from "../../middlewares/users/authorization.js";


const route= Router();


route.use(verifyJWT)
route.route('/profile').get(getMyEcomProfile).patch(updateEcomProfile)
route.route('/profile/myOrders').get(getMyOrders);

export default route