import { Router } from "express";
import { verifyJWT } from "../../middlewares/users/authorization.js";
import {createCategory_S, getAllSellerCategories_S, getCategoryById, updateCategoryById_S, deleteCategoryById_S,
    getAllPredefinedCategories} from "../../controllers/Ecom/category.controller.js";

const route = Router();


route.use(verifyJWT);

route.route('/category').get(getAllSellerCategories_S).post(createCategory_S);

route.route('/category/predefined').get(getAllPredefinedCategories);

route.route('/category/:categoryId').get(getCategoryById)
                                    .patch(updateCategoryById_S)
                                    .delete(deleteCategoryById_S)

export default route;