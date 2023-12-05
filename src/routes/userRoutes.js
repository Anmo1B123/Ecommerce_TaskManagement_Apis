import { Router } from "express";
import {getAllUsers,createNewUser,getUser,updateUser,deleteUser} from '../controllers/userControllers.js';
import {upload} from '../middlewares/multer.js';
import { errorHandler } from "../middlewares/errorHandler.js";
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
.get(getUser)
.patch(upload.fields([
                        {name: 'avatar', maxCount: 1},
                        {name: 'coverimage', maxCount: 1}
                    ]),updateUser)
.delete(deleteUser);

/*********************************************************************/

export default route;