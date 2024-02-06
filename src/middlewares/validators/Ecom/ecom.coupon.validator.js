import {body, query, param, validationResult} from 'express-validator'
import { asyncHandler } from '../../Handlers/asyncHandler.js';
import apiError from '../../../utils/apiError.js';


const createCouponValidation =()=>{

    return [ body('name').trim().notEmpty().withMessage('coupon name is required.'), 
    body('couponCode').trim().notEmpty().withMessage('coupon code is required'),
    body('type').optional().trim().custom(value=>{
        const allowedValues = ['flat', 'percent'];
        return (allowedValues.includes(value))
    }),
    body('discount').trim().notEmpty().withMessage('discount is required.'),
    body('minimumCartValue').optional().trim().notEmpty().withMessage('minimum cart value cannot be empty'),
    body('startDate').optional().trim().notEmpty().withMessage('start date is required.').isDate().withMessage('Invalid Start Date'),
    body('expiryDate').optional().trim().notEmpty().withMessage('expiry date is required.').isDate().withMessage('Invalid Expiry Date')
    ] 

};

// .withMessage() gets invoked only when the previous check returns a falsy value.

const updateCouponValidation =()=>{

    return createCouponValidation()


};

const validationResultHandler = asyncHandler((req, res, next)=>{

    const {errors} =validationResult(req)

    if(!errors.length) return next()

   const errorArr= errors.map((errorObj)=>{

     return errorObj.msg

    });

    const errorMsgString= errorArr.join(' ')
    throw new apiError(`${errorMsgString}`, 400);


});


export {
    createCouponValidation,
    updateCouponValidation,
    validationResultHandler
}