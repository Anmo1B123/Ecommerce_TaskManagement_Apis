import mongoose from "mongoose";
import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js";
import apiResponse from "../../utils/apiResponse.js";
import apiError from "../../utils/apiError.js";
import { coupons } from "../../models/Ecom/coupon.js";
import moment from "moment";


const createCoupon = asyncHandler(async(req, res)=>{


    const { name, couponCode, type = 'flat', discount, minimumCartValue=0, startDate=undefined, expiryDate=undefined} = req.body;

    const duplicateCoupon = await coupons.findOne({couponCode: couponCode.trim().toUpperCase()});

    if (duplicateCoupon)
    {
        throw new apiError("Coupon with code " + duplicateCoupon.couponCode + " already exists",409);
    }

    if (minimumCartValue && +minimumCartValue < +discount) 
    {
        throw new apiError(400,"Minimum cart value must be greater than or equal to the discount value");
    }

    const modifiedISOStartDateTemp = moment(startDate,'DD/MM/YY').toISOString();

    const modifiedISOStartDate = moment(startDate,'DD/MM/YY').startOf('day').toISOString();
    const modifiedISOExpiryDate = moment(expiryDate,'DD/MM/YY').endOf('day').toISOString();

    const TimestampStart = new Date(modifiedISOStartDateTemp).getTime();
    const TimestampExpiry = new Date(modifiedISOExpiryDate).getTime();

    if(TimestampStart < Date.now() ) throw new apiError('start date cannot be less than the current date', 400);
    if(TimestampExpiry < Date.now() ) throw new apiError('expiry date cannot be less than the current date', 400);

    const coupon = await coupons.create({ name, couponCode, type, discount,
                                        minimumCartValue, startDate:modifiedISOStartDate, 
                                        expiryDate:expiryDate?expiryDate:modifiedISOExpiryDate, 
                                        owner: req.user._id});

    if(!coupon) throw new apiError('Something went wrong while creating the coupon', 500);

    res.status(200).json(new apiResponse(200, 'coupon created successfully', {coupon}))

});


const applyCoupon = asyncHandler(async(req, res)=>{




});


const removeCouponFromCart = asyncHandler(async(req, res)=>{



});


const updateCouponActiveStatus = asyncHandler(async(req, res)=>{



});


const getAllCoupons = asyncHandler(async(req, res)=>{



});


const getValidCouponsForCustomer = asyncHandler(async(req, res)=>{



});


const getCouponById = asyncHandler(async(req, res)=>{



});


const updateCoupon = asyncHandler(async(req, res)=>{



});


const deleteCoupon = asyncHandler(async(req, res)=>{



});


export {
    createCoupon,
    applyCoupon,
    removeCouponFromCart,
    updateCouponActiveStatus,
    getAllCoupons,
    getValidCouponsForCustomer,
    getCouponById,
    updateCoupon,
    deleteCoupon
}