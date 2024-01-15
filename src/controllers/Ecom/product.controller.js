import mongoose, { isObjectIdOrHexString } from "mongoose";
import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js";
import { products } from "../../models/Ecom/product.js";
import { apiFeatures, productApiFeatures } from "../../utils/apiFeatures.js";
import apiResponse from "../../utils/apiResponse.js";
import apiError from "../../utils/apiError.js";
import { category } from "../../models/Ecom/category.js";
import { uploadOnCloudinary } from "../../middlewares/Handlers/cloudinary.js";




// BUYER- CENTRIC CONTROLLERS
const getAllProducts_B = asyncHandler(async(req, res)=>{

    if(Object.keys(req.query).length===0){

     
       const products = await products.find();
       if(!products) throw new apiError('no product found to be shown', 404);

       res.status(200).json(new apiResponse(200, 'Success', products));

    }else{


    const query= new productApiFeatures(products.find(), req.query).search().filters().pagination().sort().fields()

        
        const limit = query.limit;
        const page= query.page;
        const Total_Products = await query.docsCount
        const Products_on_this_page = await query.docsOnthisPage
        const data= await query.queryObj;

        productApiFeatures.pageErrorfunc(Total_Products, req);

        res.status(200).json(new apiResponse(200, 'Success', {Total_Products, page, limit, Products_on_this_page, data}))

    }



});


// SELLER-CENTRIC CONTROLLERS

const getAllProducts_S = asyncHandler(async(req, res)=>{

    if(Object.keys(req.query).length===0){

    const productArr=  await products.aggregate([
                                                {
                                                    $match: {
                                                            /* seller:req.user?._id :- DON'T DO THIS bcoz- aggregate method is being worked directly of mongodb driver not mongoose so automatic conversion to mongo object id from string id won't happen. So use below code for the same. */

seller: new mongoose.Types.ObjectId(req.user?._id) 

/* The above code will create a new instance of the type mongodb Id from the string. */
                                                            }
                                                },
                                                {
                                                    $lookup:{
                                                            from:'users',
                                                            localField:'$sellerDefinedCategory',
                                                            foreignField:'$_id',
                                                            as:'categoryDefinedBySeller'
                                                            }
                                                },
                                                {
                                                    $unwind: '$categoryDefinedBySeller' // Unwind the array to access individual elements
                                                },
                                                {
                                                    $addFields:{'SellerCategory': '$categoryDefinedBySeller.name'}
                                                },
                                                {
                                                    $project:{'$categoryDefinedBySeller':-1}
                                                },
                                                {
                                                    $sort:{'$createdAt':-1}
                                                }
                                                ])

    if(! productArr.length) throw new apiError('No product found', 404);

    res.status(200).json(new apiResponse(200, 'Success', {products:productArr}))

    }
    else{


        const productAggregate= products.aggregate([
            {
                $match: {
                        seller:req.user?._id,
                        name:req.query.name || undefined,
                        preDefinedCategories:{ $in: [req.query.preDefinedCategory || undefined]},
                        sellerDefinedCategory: req.query.sellerDefinedCategory || undefined
                        }
            },
            {
                $lookup:{
                        from:'users',
                        localField:'$sellerDefinedCategory',
                        foreignField:'$_id',
                        as:'categoryDefinedBySeller'
                        }
            },
            {
                $unwind: '$categoryDefinedBySeller' // Unwind the array to access individual elements
            },
            {
                $addFields:{'SellerCategory': '$categoryDefinedBySeller.name'}
            },
            {
                $project:{'$categoryDefinedBySeller':-1}
            }
            ])


            const options = {
                limit:req.query?.limit || 5,
                page:req.query?.page || 1,
                sort:req.query?.sort || '-createdAt',
            };

            let result;
            try {
                result = await products.aggregatePaginate(productAggregate, options)
            } catch (error) {
                console.log(error)
            }

           if(!result) throw new apiError('No product found', 404);

            const products = result?.docs;
            const total_Products= result?.totalDocs;
            const products_on_this_page= result?.limit;
            const page = result?.page;
            const total_Pages= result?.totalPages


            res.status(200).json(new apiResponse(200, 'Success', {total_Products, total_Pages, 
                                                                    page, products_on_this_page,
                                                                    products }))
    }

})


const createProduct_S = asyncHandler(async(req, res)=>{

    
    const {name, description, price, stock, preDefinedCategories, sellerDefinedCategory} = req.body

    if(!req.files.mainImage) throw new apiError('Main Image for the product is required', 400);

    const mainImagefilepath=req.files?.mainImage? req.files.mainImage[0].path : ""; 

    const response = await uploadOnCloudinary(mainImagefilepath, "products/main-image");

    if(!response.url) throw new apiError('Something went wrong while saving image. Try again later', 500);
    
    const mainImageUrl = response?.url
    const mainImagePublicId= response?.public_id 

    const mainImageObj = {

        url:mainImageUrl,
        publicId:mainImagePublicId,
        localpath:mainImagefilepath
    }

    let subImagesfilepathArr =[];
    let subImagesArrayOfSubImagesObj = [];

    if(req.files?.subImages) {

       let subImagesArray= req.files.subImages
        

       subImagesArray.forEach((image) => {
            
        subImagesfilepathArr.push(image.path)

        });

        if(subImagesfilepathArr.length){

            subImagesfilepathArr.forEach(async (current_loop_path)=>{

                const response = await uploadOnCloudinary(current_loop_path, "products/sub-images");
                const subImageUrl = response?.url;
                const subImagePublicId= response?.public_id;

                subImagesArrayOfSubImagesObj.push({
                                                    url:subImageUrl, 
                                                    publicId: subImagePublicId,
                                                    localpath:current_loop_path
                                                });

            })
        }

    }

    const {_id:sellerCategoryIdByname} = await category.findOne({name:sellerDefinedCategory})

const createdProduct = await products.create({name, 
                                        description, 
                                    price, 
                                stock, 
                            mainImage:mainImageObj,
                            subImages:subImagesArrayOfSubImagesObj.length?subImagesArrayOfSubImagesObj:undefined,
                                    seller:req.user?._id,
                                        preDefinedCategories, 
                                            sellerDefinedCategory:sellerCategoryIdByname
                                                })
   
if(!createdProduct) throw new apiError('Something went wrong while creating the product.Try agin later.', 500);

res.status(200).json(new apiResponse(200, 'success', createdProduct));

});


const getProductById_S = asyncHandler(async(req, res)=>{

    const {id} = req.params;

    if(! mongoose.Types.ObjectId.isValid(id)) throw new apiError('Not a valid id', 400);

    const productArr=  await products.aggregate([
                                                {
                                                    $match:{
                                                            seller:req.user?._id, 
                                                            _id:id
                                                            }
                                                },
                                                {
                                                    $lookup:{
                                                            from:'users',
                                                            localField:'$sellerDefinedCategory',
                                                            foreignField:'$_id',
                                                            as:'categoryDefinedBySeller'
                                                            }
                                                },
                                                {
                                                    $unwind: '$categoryDefinedBySeller' // Unwind the array to access individual elements
                                                },
                                                {
                                                    $addFields:{'SellerCategory': '$categoryDefinedBySeller.name'}
                                                },
                                                {
                                                    $project:{'$categoryDefinedBySeller':-1}
                                                }
                                                ])


    if (!productArr.length) throw new apiError('No product found by this id', 404);

    const product = productArr[0];

    res.status(200).json(new apiResponse(200, 'Success', product));

});


const updateProductDetailsById = asyncHandler(async(req, res)=>{

    const {id} = req.params;

    if(! mongoose.Types.ObjectId.isValid(id)) throw new apiError('Not a valid id', 400);

    const {name, description, price, stock, preDefinedCategories, sellerDefinedCategory} = req.body;

    const updatedProduct = await products.findOneAndUpdate({seller:req.user?._id, _id:id}, req.body, {new:true})

    if(!updatedProduct) throw new apiError('No product found by this id', 404);

    res.status(200).json(new apiResponse(200, 'Product Information Updated Successfully', updatedProduct));
    

});


const updateProductMainImageById = asyncHandler(async(req, res)=>{

    const {id} = req.params;

    if(! mongoose.Types.ObjectId.isValid(id)) throw new apiError('Not a valid Id', 400);

    const mainImagefilepath =  req.file?.path;

    if (!mainImagefilepath) throw new apiError('Main image for the product is required', 400);


    const foundProduct = await products.findOne({seller:req.user?._id, _id:id});
    
    if(!foundProduct) throw new apiError('Product not found by this id', 404);

    const response = await uploadOnCloudinary(mainImagefilepath);

    if(! response.url)throw new apiError(
                    'Something went wrong while updating the product main-image. Try again later.',500
                                        );

    const mainImageObj = {

        url: response.url,
        publicId: response.public_id,
        localpath: mainImagefilepath
    }


    foundProduct.mainImage= mainImageObj;

    await foundProduct.save();

    res.status(200).json(new apiResponse(200, 'Image updated!'));


});


const updateProductSubImagesById = asyncHandler(async(req, res)=>{

    const {id} = req.params;

    if(! mongoose.Types.ObjectId.isValid(id)) throw new apiError('Not a valid Id', 400);

    const subImagesFilePath =  req.files?.path;

    if (!subImagesFilePath) throw new apiError('Sub images for the product is required', 400);


    const foundProduct = await products.findOne({seller:req.user?._id, _id:id});
    
    if(!foundProduct) throw new apiError('Product not found by this id', 404);

    const response = await uploadOnCloudinary(mainImagefilepath);

    if(! response.url)throw new apiError(
                    'Something went wrong while updating the product main-image. Try again later.',500
                                        );

    const mainImageObj = {

        url: response.url,
        publicId: response.public_id,
        localpath: mainImagefilepath
    }


    foundProduct.mainImage= mainImageObj;

    await foundProduct.save();

    res.status(200).json(new apiResponse(200, 'Image updated!'));


});


const deleteProductSubImageById= asyncHandler(async(req, res)=>{

    const {id, subImageId} = req.params;

    const foundProduct = await products.findOne({seller:req.user?._id, _id:id});

    if(!foundProduct) throw new apiError('No product found by this id', 404);

    const ProductWithDeletedSubImage =await products.findOneAndUpdate({ $and:[{seller:req.user?._id},
                                                                               {_id:id},
                                                                               {subImages:{$elemMatch:{_id:subImageId}}} 
                                                                            ]
                                                                    },
                                                                    {$pull:{subImages:{_id:subImageId}}},
                                                                    {new:true}
                                                                    );

    if(!ProductWithDeletedSubImage) throw new apiError('sub Image not found by this Id', 404);

    res.status(200).json(new apiResponse(200, 'sub-image deleted', ProductWithDeletedSubImage))


});






































export {getAllProducts}