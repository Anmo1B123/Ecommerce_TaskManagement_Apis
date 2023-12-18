import { fileDeleteFunction } from "../utils/fsFileDelete.js";

export const asyncHandler= (requesthandler)=>{
 return (req, res, next)=>{
 Promise.resolve(requesthandler(req, res, next)).catch((error)=>{
 next(error)});
}
};

