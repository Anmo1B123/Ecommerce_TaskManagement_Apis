import { fileDeleteFunction } from "../utils/helpers/fsFileDelete.js";

export const asyncHandler= (requesthandler)=>{
 return (req, res, next)=>{
 Promise.resolve(requesthandler(req, res, next)).catch((error)=>{
 next(error)});
}
};

