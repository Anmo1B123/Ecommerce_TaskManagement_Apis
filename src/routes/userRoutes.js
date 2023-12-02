import { Router } from "express";
import {getAllUsers,createNewUser,getUser,updateUser,deleteUser} from '../controllers/userControllers.js';
import {upload} from '../middlewares/multer.js';
import { errorHandler } from "../middlewares/errorHandler.js";
const route= Router();


route.route('/').get(getAllUsers).post(upload.fields([
    {name: 'avatar', maxCount: 1},
    {name: 'coverimage', maxCount: 1}
]),createNewUser);
route.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
route.use(errorHandler)


export default route;