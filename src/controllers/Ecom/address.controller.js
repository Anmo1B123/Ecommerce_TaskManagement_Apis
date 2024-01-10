import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js";
import mongoose from "mongoose";
import { address } from "../../models/Ecom/address.js";
import { users } from "../../models/users.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";




const createAddress = asyncHandler( async (req, res)=>{

    const {addressLine1, addressLine2, street, city, state, country, postalCode} = req.body



    const createdAddress = await address.create({addressLine1, 
                                                addressLine2, 
                                                street, 
                                                city, 
                                                state, 
                                                country, 
                                                postalCode,
                                                owner:req.user?._id
                                                })

    if(!createdAddress) throw new apiError('Something went wrong while adding the address',500)

    res.status(200).json(new apiResponse(200, 'Address was created', createdAddress));                                            

    
});


const getAllAddress= asyncHandler(async (req, res)=>{

    const allAddresses= await address.find({owner:req.user?._id});

    if(allAddresses.length===0) throw new apiError('No address found', 404);

    res.status(200).json(new apiResponse(200, 'Success', allAddresses));


});


const getAddressById= asyncHandler(async (req, res)=>{

    const {id} = req.params;
    
    if(! mongoose.Types.ObjectId.isValid(id)) throw new apiError('Not a valid id', 400);

    const addressFound= await address.findOne({owner:req.user?._id, _id:id});

    if(!addressFound) throw new apiError('Address by the id not found', 404);

    res.status(200).json(new apiResponse(200, 'Success', addressFound));


});


const updateAddressById = asyncHandler(async(req,res)=>{

    const {addressLine1, addressLine2, street, city, state, country, postalCode} = req.body
    const {id} = req.params;

    const updatedAddress = await address.findOneAndUpdate({owner:req.user?._id, _id:id},
                                                            req.body,
                                                            {new:true});


    if(!updatedAddress) throw new apiError('Address by the id not found', 400);

    res.status(200).json(new apiResponse(200, 'Address updated!', updatedAddress))

});


const deleteAddressById= asyncHandler(async(req, res)=>{


    const {id} = req.params;

    
    if(! mongoose.Types.ObjectId.isValid(id)) throw new apiError('Not a valid id', 400);

    const addressFound= await address.findOne({owner:req.user?._id, _id:id});

    if(!addressFound) throw new apiError('Address by the id not found', 404);

    const acknowledgement= await address.findOneAndDelete({owner:req.user?._id, _id:id})

    if(!acknowledgement) throw new apiError('Something went wrong while deleting the address', 500);

    res.status(200).json(new apiResponse(200, 'Address deleted', acknowledgement))

});




export {createAddress, getAllAddress, getAddressById, updateAddressById, deleteAddressById};