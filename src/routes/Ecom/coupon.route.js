import { Router } from "express";
import {createCouponValidation, validationResultHandler} from "../../middlewares/validators/Ecom/ecom.coupon.validator.js";
import { verifyJWT } from "../../middlewares/users/authorization.js";
import {
    createCoupon_s,
    applyCoupon,
    removeCouponFromCart,
    updateCouponActiveStatusToggle_s,
    getAllCoupons_s,
    getValidCouponsForCustomer,
    getCouponById_s,
    updateCoupon_s,
    deleteCoupon_s
} from "../../controllers/Ecom/coupon.controller.js";


const route = Router();


route.use(verifyJWT);

route.route('/coupon').get(getAllCoupons_s)
                      .post(createCouponValidation(), validationResultHandler, createCoupon_s)

route.route('/coupon/toggleActiveStatus/:couponId').patch(updateCouponActiveStatusToggle_s)

route.route('/coupon/validCoupons').get(getValidCouponsForCustomer);                      
route.route('/coupon/apply').patch(applyCoupon);
route.route('/coupon/remove').patch(removeCouponFromCart)


route.route('/coupon/:couponId').get(getCouponById_s)
                                .patch(updateCoupon_s)
                                .delete(deleteCoupon_s)

export default route;