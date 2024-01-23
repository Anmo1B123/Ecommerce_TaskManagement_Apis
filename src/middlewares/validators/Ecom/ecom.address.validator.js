import {body, query, param, validationResult} from 'express-validator'
import { asyncHandler } from '../../Handlers/asyncHandler.js';
import apiError from '../../../utils/apiError.js';

Array.prototype.isEmpty=function(){

    return this.length === 0
}; //I PROBABLY SHOULD NOT DO THIS.....

export const createAddressValidation = ()=>{

 return [body('addressLine1').trim().notEmpty().withMessage('address line 1 is required.'), 
    body('addressLine2').optional().trim(),
    body('street').trim().notEmpty().withMessage('street is required.'),
    body('city').trim().notEmpty().withMessage('city is required.'),
    body('state').trim().notEmpty().withMessage('state is required.'),
    body('postalCode').trim().notEmpty().withMessage('postal code is required.').isPostalCode('IN').withMessage('Invalid Postal Code')
    
    ] 

};

export const updateAddressValidation= ()=>{

   const validationChainArray = createAddressValidation(); // Thought of using the above function to save time.

    validationChainArray.unshift(param('id').isMongoId().withMessage('Not a valid id'))

    return validationChainArray

};



export const validationResultHandler=asyncHandler((req, res, next)=>{

    const {errors} =validationResult(req)

    if(errors.isEmpty()) return next()

   const errorArr= errors.map((errorObj)=>{

     return errorObj.msg

    });

    const errorMsgString= errorArr.join(' ')
    throw new apiError(`${errorMsgString}`, 400);
});



