class apiResponse{
    constructor(statuscode, message='success', data="" ){
        this.status= statuscode;
        this.message= message;
        this.data= data;
        this.success= statuscode<400
    }
}

export default apiResponse;