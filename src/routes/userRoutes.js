import { Router } from "express";
import {getAllUsers,createNewUser,getUser,updateUser,deleteUser} from '../controllers/userControllers.js';
import {upload} from '../middlewares/multer.js';
import { errorHandler } from "../middlewares/errorHandler.js";
import { emailSymbolChecker } from "../middlewares/emailsymbolChecker.js";
import { ifAdmin, protect } from "../middlewares/authorization.js";
const route= Router();

/*********************************************************************/
route.route('/')
.get(getAllUsers)
.post(upload.fields ([
                        {name: 'avatar', maxCount: 1},
                        {name: 'coverimage', maxCount: 1}
                    ]),createNewUser);

                    /*although upload/multer methods are being used but even if user 
                      does not upload any file on frontend/multipart-form using postman/thunderClient
                      no error shall come. And req.body data can be accessed thru multipart-form only when
                      multermiddleware is in use before the route

                    */
/*********************************************************************/

route.route('/:id')
.get(protect,getUser)
.patch(upload.fields([
                        {name: 'avatar', maxCount: 1},
                        {name: 'coverimage', maxCount: 1}
                    ]),emailSymbolChecker,updateUser)
.delete(protect,ifAdmin('admin'),deleteUser);

/*********************************************************************/

export default route;