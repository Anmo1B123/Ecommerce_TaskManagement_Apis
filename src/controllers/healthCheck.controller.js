import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../middlewares/Handlers/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
    console.log("Client ip: ", req.clientIp);
    return res
      .status(200)
      .json(new apiResponse(200, "OK", "Health check passed"));
  });
  
  export { healthCheck };