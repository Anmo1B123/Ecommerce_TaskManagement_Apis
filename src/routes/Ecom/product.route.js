import { Router } from "express";

import { getAllProducts_B, getAllProducts_S, createProduct_S, getProductById_S,
    updateProductDetailsById, updateProductMainImageById, updateProductSubImageById,
    addSubImagesToProductById, deleteProductSubImageById} from "../../controllers/Ecom/product.controller.js";

import { verifyJWT } from "../../middlewares/users/authorization.js";



const route = Router();

// route.use(verifyJWT); //Will turn on once this apis are checked

route.route('/showAllProducts').get(getAllProducts_B);

route.route('/product').get(getAllProducts_S).post(createProduct_S);
route.route('/product/:id').get(getProductById_S).patch(updateProductDetailsById);

route.route('/product/:id/MainImage').patch(updateProductMainImageById);
route.route('/product/:id/SubImage/:subImageId').patch(updateProductSubImageById)
                                                .delete(deleteProductSubImageById);

route.route('/product/:id/addSubImages').patch(addSubImagesToProductById)


export default route;