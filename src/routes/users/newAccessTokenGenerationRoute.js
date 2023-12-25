import express from "express";
import { newAccessToken } from "../../controllers/users/newAccessTokenGeneration.js";
import { newAccessTokenVerifyRefreshToken } from "../../middlewares/users/newAccessTokenMiddle.js";

const route= express.Router();


route.route('/new_accessToken').get(newAccessTokenVerifyRefreshToken, newAccessToken);




export default route;