import { Router } from "express";
import { upload } from "../../middlewares/Handlers/multer.js";

import { getAllProducts_B, getAllProducts_S, createProduct_S, getProductById_S,
    updateProductDetailsById, updateProductMainImageById, updateProductSubImageById,
    addSubImagesToProductById, deleteProductSubImageById} from "../../controllers/Ecom/product.controller.js";

import { verifyJWT } from "../../middlewares/users/authorization.js";



const route = Router();

// route.use(verifyJWT); //Will turn on once these apis are checked

route.route('/product/showAllProducts').get(getAllProducts_B);

route.route('/product').get(getAllProducts_S).post(upload.fields([
                                                    {name:'mainImage', maxCount:1},
                                                    {name:'subImages', maxCount:4}
                                                    ]),createProduct_S);
route.route('/product/:id').get(getProductById_S).patch(updateProductDetailsById);

route.route('/product/:id/MainImage').patch(upload.single('mainImage'),updateProductMainImageById);
route.route('/product/:id/SubImage/:subImageId').patch(upload.single('subImage'),updateProductSubImageById)
                                                .delete(deleteProductSubImageById);

route.route('/product/:id/addSubImages').patch(upload.array('subImages', 4),addSubImagesToProductById)


export default route;