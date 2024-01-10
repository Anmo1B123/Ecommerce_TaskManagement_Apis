import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js"
import { ecomProfile } from "../../models/Ecom/profile.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";


const getMyEcomProfile= asyncHandler( async(req, res)=>{

    const profile= await ecomProfile.findOne({owner:req.user?._id})

    if(!profile) throw new apiError('Profile not found', 404)

    res.status(200).json(new apiResponse(200, 'success', profile))


});

const updateEcomProfile= asyncHandler(async(req,res)=>{

    const {firstname, lastname, phoneNumber, countryCode, alternatePhoneNumber} = req.body;
    

    const updatedProfile= await ecomProfile.findOneAndUpdate( {owner:req.user?._id},
                                                        {
                                                          $set:{
                                                            firstname:firstname?.trim()?firstname:undefined,
                                                            lastname:lastname?.trim()?lastname:undefined,
                                                            countryCode:countryCode?.trim()?countryCode:undefined,
                                                            phoneNumber:phoneNumber?.trim()?phoneNumber:undefined,
                                                            alternatePhoneNumber:alternatePhoneNumber?.trim()?alternatePhoneNumber:undefined}
                                                        },
                                                        {new:true})

    if(!updatedProfile) throw new apiError('something went wrong while updating profile. Try again later.', 500)

    res.status(200).json(new apiResponse(200, 'profile updated', updatedProfile))
    
});


const getMyOrders= asyncHandler(async(req,res)=>{



});


export {getMyEcomProfile,
    updateEcomProfile,
    getMyOrders}


