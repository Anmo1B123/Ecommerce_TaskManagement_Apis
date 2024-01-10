import { Router } from "express";
import { verifyJWT } from "../../middlewares/users/authorization.js";
import { createAddress, deleteAddressById, getAddressById, getAllAddress, updateAddressById } from "../../controllers/Ecom/address.controller.js";
import { createAddressValidation, updateAddressValidation, validationResultHandler } from "../../middlewares/validators/Ecom/ecom.address.validator.js";



const route = Router();

// route.use(verifyJWT);
route.route('/address').get(getAllAddress)
                       .post(createAddressValidation(),validationResultHandler,createAddress);
                       
route.route('/adress/:id').get(getAddressById)
                          .patch(updateAddressValidation(),validationResultHandler,updateAddressById)
                          .delete(deleteAddressById);

export default route;