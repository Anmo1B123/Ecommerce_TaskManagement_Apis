import { Router } from "express";

import { getUserCart, addItemOrUpdateItemQuantity, 
        removeItemFromCart, clearCart} from "../../controllers/Ecom/cart.controller.js";

import { verifyJWT } from "../../middlewares/users/authorization.js";


const route = Router();


route.use(verifyJWT);

route.route('/cart/:productId?').get(getUserCart).patch(addItemOrUpdateItemQuantity).delete(removeItemFromCart)
route.route('/cart/clearCart').patch(clearCart);

export default route;