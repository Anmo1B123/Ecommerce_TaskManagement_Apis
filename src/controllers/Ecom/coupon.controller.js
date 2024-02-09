import mongoose from "mongoose";
import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js";
import apiResponse from "../../utils/apiResponse.js";
import apiError from "../../utils/apiError.js";
import { coupons } from "../../models/Ecom/coupon.js";
import moment from "moment-timezone";
import { getCart } from "./cart.controller.js";
import { cart } from "../../models/Ecom/cart.js";
import { couponApiFeatures } from "../../utils/apiFeatures.js";


//BUYER CENTRIC CONTROLLERS------>
const applyCoupon = asyncHandler(async(req, res)=>{

    const { couponCode } = req.body;

    if(!couponCode.trim()) throw new apiError('coupon code is required', 400);

    let aggregatedCoupon = await coupons.aggregate([
                                                      { 
                                                        $match:{
                                                            couponCode:couponCode?.trim().toUpperCase(),
                                                            startDate: {$lt: new Date()},
                                                            expiryDate:{$gt: new Date()},
                                                            isActive:true
                                                        }
                                                      },
                                                    ]);

    const coupon=aggregatedCoupon[0];

    if(!coupon) throw new apiError('Invalid coupon code',400);

    const userCart = await getCart(new mongoose.Types.ObjectId(req.user?._id));

    if(userCart?.cartTotal < coupon.minimumCartValue){

        throw new apiError('Add items worth INR '+ (coupon.minimumCartValue - userCart.cartTotal)
                            + '/- or more to apply this coupon')
    }


    await cart.findOneAndUpdate({
                                    owner:req.user?._id
                                },
                                {
                                    $set:{coupon:coupon._id}
                                })

    const newCart = await getCart(new mongoose.Types.ObjectId(req.user?._id));

    return res.status(200).json(new apiResponse(200, 'Coupon applied successfully', newCart))

});


const removeCouponFromCart = asyncHandler(async(req, res)=>{

    await cart.findOneAndUpdate({
        owner:req.user?._id
    },
    {
        $set:{coupon:null}
    })

    const newCart = await getCart(new mongoose.Types.ObjectId(req.user?._id));

    return res.status(200).json(new apiResponse(200, 'coupon removed successfully', newCart))
});


const getValidCouponsForCustomer = asyncHandler(async(req, res)=>{

    let {page=1, limit=10, sort= '-createdAt'} = req.query;

    page= parseInt(page);
    limit= parseInt(limit);

    const validCouponsAggregation = coupons.aggregate([
                                                    {
                                                        $match:{
                                                            couponCode:couponCode?.trim().toUpperCase(),
                                                            startDate: {$lt: new Date()},
                                                            expiryDate:{$gt: new Date()},
                                                            isActive:true
                                                        }
                                                    }])

   const result = await coupons.aggregatePaginate(
                            validCouponsAggregation,
                            {
                                page,
                                limit,
                                sort
                            })
    
    if(!result) throw new apiError('No valid coupons found', 404);

    const Coupons = result?.docs;
    const total_Coupons= result?.totalDocs;
    const Coupons_on_this_page= result?.limit;
    const Page = result?.page;
    const total_Pages= result?.totalPages
                
                
    return res.status(200).json(new apiResponse(200, 'all valid coupons fetched!', {total_Coupons, total_Pages, 
                                                            Page, Coupons_on_this_page,
                                                            Coupons }))

});


//SELLER CENTRIC CONTROLLERS------>
const createCoupon_s = asyncHandler(async(req, res)=>{


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

    const modifiedISOStartDateTemp = moment(startDate,'YYYY/MM/DD').toISOString();

    const modifiedISOStartDate = moment(startDate,'YYYY/MM/DD').toISOString();
    
    const modifiedISOExpiryDate = moment(expiryDate,'YYYY/MM/DD').toISOString();

    const TimestampStart = new Date(modifiedISOStartDateTemp).getTime();
    const TimestampExpiry = new Date(modifiedISOExpiryDate).getTime();

    if(TimestampStart < Date.now() ) throw new apiError('start date cannot be less than the current date', 400);
    if(TimestampExpiry < Date.now() ) throw new apiError('expiry date cannot be less than the current date', 400);

    const coupon = await coupons.create({ name, couponCode, type, discount,
                                        minimumCartValue, startDate:modifiedISOStartDate, 
                                        expiryDate:expiryDate?expiryDate:modifiedISOExpiryDate, 
                                        owner: req.user._id});

    if(!coupon) throw new apiError('Something went wrong while creating the coupon', 500);

    coupon._doc.startDate=moment(coupon.startDate).tz('Asia/Kolkata').toLocaleString()
    coupon._doc.expiryDate=moment(coupon.expiryDate).tz('Asia/Kolkata').toLocaleString()
    res.status(200).json(new apiResponse(200, 'coupon created successfully', {coupon}))

});


const updateCouponActiveStatusToggle_s = asyncHandler(async(req, res)=>{

    const {couponId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(couponId)) throw new apiError('Not a valid id', 400);

    const foundCoupon = await coupons.findOne({owner:req.user?._id, _id:couponId})

    if(!foundCoupon) throw new apiError('coupon not found', 404);

    const currentActiveState= foundCoupon.isActive;

    foundCoupon.isActive=!currentActiveState;
    foundCoupon.save({validateBeforeSave:false})

    const newFoundCoupon = await coupons.findOne({owner:req.user?._id, _id:couponId})

    newFoundCoupon.startDate=moment(newFoundCoupon.startDate).tz('Asia/Kolkata').toLocaleString()
    newFoundCoupon.expiryDate=moment(newFoundCoupon.expiryDate).tz('Asia/Kolkata').toLocaleString()
    /*we will always save a correct timezone in the specified schema and retrieve that to correctly 
    display it to the correct timezone to the frontend and that timezone shall be the responsibility
    of the frontend.*/
    return res.status(200).json(new apiResponse(200, 'coupon status updated', newFoundCoupon))


});


const getAllCoupons_s = asyncHandler(async(req, res)=>{

    if(Object.keys(req.query).length===0){

     
        const foundCoupons = await coupons.find();
        if(!foundCoupons) throw new apiError('no coupon found to be shown', 404);
 
        res.status(200).json(new apiResponse(200, 'Success', foundCoupons));
 
     }else{

        const query= new couponApiFeatures(coupons.find(), req.query, coupons).search().pagination().sort().fields()

        
        const limit = query.limit;
        const page= query.page;
        const Total_Coupons = await query.docsCount
        const Coupons_on_this_page = await query.docsOnthisPage
        const data= await query.queryObj;

        couponApiFeatures.pageErrorfunc(Total_Coupons, req);

        res.status(200).json(new apiResponse(200, 'Success', {Total_Coupons, page, limit, Coupons_on_this_page, data}))

    }

});


const getCouponById_s = asyncHandler(async(req, res)=>{

    const {couponId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(couponId)) throw new apiError('Not a valid id', 400);

    const coupon = await coupons.findOne({owner: req.user?._id, _id:couponId});

    if(!coupon) throw new apiError('coupon not found', 404);

    return res.status(200).json(new apiResponse(200, 'success', coupon))

});


const updateCoupon_s = asyncHandler(async(req, res)=>{

    const {couponId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(couponId)) throw new apiError('Not a valid id', 400);

    const {name, couponCode, type, discount, minimumCartValue, startDate, expiryDate} = req.body;

    const updatedCoupon = await coupons.findOneAndUpdate({owner:req.user?._id, _id:couponId},
                                                         req.body,
                                                         {new:true, runValidators:true})

    if(!updatedCoupon || !'_id' in updatedCoupon) throw new apiError('coupon not found', 404);
    
    updatedCoupon._doc.startDate= moment(updatedCoupon.startDate).tz('Asia/Kolkata').toLocaleString()
    updatedCoupon._doc.expiryDate= moment(updatedCoupon.expiryDate).tz('Asia/Kolkata').toLocaleString()

    return res.status(200).json(new apiResponse(200, 'coupon was successfully updated', {updatedCoupon}))

});


const deleteCoupon_s = asyncHandler(async(req, res)=>{

    const {couponId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(couponId)) throw new apiError('Not a valid id', 400);

    const deletedCoupon = await coupons.deleteOne({owner:req.user?._id, _id:couponId});

    if(!deletedCoupon) throw new apiError('coupon does not exist', 404);
    
    return res.status(200).json(new apiResponse(200, "coupon deleted successfully", {deletedCoupon}))

});


export {
    createCoupon_s,
    applyCoupon,
    removeCouponFromCart,
    updateCouponActiveStatusToggle_s,
    getAllCoupons_s,
    getValidCouponsForCustomer,
    getCouponById_s,
    updateCoupon_s,
    deleteCoupon_s
}