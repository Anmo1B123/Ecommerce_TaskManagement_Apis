import { Router } from "express";
import { emailVerifyRequest, emailVerificationProcess} from "../../controllers/users/emailVerify.js";
import { verifyJWT } from "../../middlewares/users/authorization.js";

const route= Router();

route.use(verifyJWT);
route.route('/emailVerifyRequest').post(emailVerifyRequest);
route.route('/emailVerificationProcess/:token').patch(emailVerificationProcess);


export default route;
 