export const asyncHandler= (requesthandler)=>{

 (req, res, next)=>{
 return Promise.resolve(requesthandler(req, res, next)).catch((error)=>next(error));
}
};

