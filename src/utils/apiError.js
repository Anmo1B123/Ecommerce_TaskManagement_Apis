class apiError extends Error{
    constructor(message='something went wrong', statuscode=500, stack=""){
        super(message);
        this.statuscode= statuscode;
        this.isOperational=true;
        if (stack){
        this.stack= stack}
        else{
        Error.captureStackTrace(this, this.constructor);
        }
        

    }
}

export default apiError;