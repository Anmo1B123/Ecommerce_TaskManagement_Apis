import express from "express";
import { newAccessToken } from "../controllers/newAccessTokenGeneration.js";
import { newAccessTokenMiddleware } from "../middlewares/newAccessTokenMiddle.js";

const route= express.Router();


route.route('/new_accessToken').get(newAccessTokenMiddleware, newAccessToken);




export default route;