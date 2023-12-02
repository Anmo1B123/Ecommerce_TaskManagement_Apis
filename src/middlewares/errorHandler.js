const errorHandler= (err, req, res, next)=>{
 err.message= err.message || 'something went wrong'
 err.statuscode= err.statuscode || 500
    res.status(err.statuscode).json(
        {
         success: false,   
         message: err.message,
         stack:  err.stack
         
        }
    )

}

export {errorHandler}