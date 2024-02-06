import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js";
import apiResponse from "../../utils/apiResponse.js";
import { preDefinedCategories } from "../../../constants/Ecom.js";
import { category } from "../../models/Ecom/category.js";
import apiError from "../../utils/apiError.js";
import mongoose from "mongoose";


// SELLER - CENTERED CONTROLLERS 

const createCategory_S = asyncHandler(async (req, res)=>{

    const {name, description} = req.body 

    const createdCategory = await category.create({name, description, owner:req.user?._id})

    if(!createdCategory) throw new apiError('something went wrong while creating the category', 500)

    res.status(200).json(new apiResponse(200, 'category created successfully', createdCategory))
});


const getAllSellerCategories_S = asyncHandler(async (req, res)=>{

    const categories = await category.find({owner:req.user?._id})

    if(!categories.length) throw new apiError('No categories Found', 500)

    res.status(200).json(new apiResponse(200, 'Success', categories))
});


const getCategoryById = asyncHandler(async(req, res)=>{

    const {categoryId} = req.params;
    if(! mongoose.Types.ObjectId.isValid(categoryId)) throw new apiError('Not a valid id', 400);

    const categoryById = await category.findOne({owner:req.user?._id, _id:categoryId});

    if(!categoryById) throw new apiError('Category by this id not found', 404);

    res.status(200).json(new apiResponse(200, 'Success', {category:categoryById}));

});


const updateCategoryById_S = asyncHandler(async (req, res)=>{

    const {categoryId} = req.params;
    const {name, description} = req.body 

    if(! mongoose.Types.ObjectId.isValid(categoryId)) throw new apiError('Not a valid id', 400);

    // if(!name.trim() || !description.trim()) throw new apiError('name or description cannot be empty', 400);

    const updatedCategory = await category.findOneAndUpdate({owner:req.user?._id,
                                                             _id:categoryId},
                                                            {
                                                                $set: {
                                                                        name: name || undefined,
                                                                        description: description || undefined
                                                                      }
                                                            },
                                                            {new:true}
                                                            )

    if(!updatedCategory) throw new apiError('Category by this id not found', 404);

    res.status(200).json(new apiResponse(200, 'category updated successfully', updatedCategory))
});


const deleteCategoryById_S = asyncHandler(async (req, res)=>{

    const {categoryId} = req.params;
    
    if(! mongoose.Types.ObjectId.isValid(categoryId)) throw new apiError('Not a valid id', 400);

    const foundCategory = await category.findOne({owner:req.user?._id, _id:categoryId})

    if(!foundCategory) throw new apiError('Category by this id not found', 404);

    const deletedCategory = await category.findOneAndDelete({owner:req.user?._id, _id:categoryId})

    if(!deletedCategory) throw new apiError('Something went wrong while deleting the category', 500)

    res.status(200).json(new apiResponse(200, 'category deleted successfully', deletedCategory))
});





// BUYER - CENTERED CONTROLLERS

// FOR GETTING AND DISPLAYING ALL PREDEFINED CATEGORIES

const getAllPredefinedCategories= asyncHandler(async(req, res)=>{
 

    res.status(200).json(new apiResponse(200, 'Success', {preDefinedCategories}))


});



export {createCategory_S, getAllSellerCategories_S, getCategoryById, updateCategoryById_S, deleteCategoryById_S,
        getAllPredefinedCategories}