import { Router } from "express";
import {createCouponValidation, validationResultHandler} from "../../middlewares/validators/Ecom/ecom.coupon.validator.js";
import { verifyJWT } from "../../middlewares/users/authorization.js";
import { createCoupon } from "../../controllers/Ecom/coupon.controller.js";


const route = Router();


route.use(verifyJWT);

route.route('/coupon').get().post(createCouponValidation(), validationResultHandler, createCoupon)


export default route;