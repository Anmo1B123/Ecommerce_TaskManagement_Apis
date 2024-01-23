import { fileDeleteFunction, fileDeleteFunctionOnError } from "../../utils/helpers/fsFileDelete.js";

function deverror (error, res) {
    error.status=error.statuscode>=400 && error.statuscode<500? 'fail':'error'
    error.message= error.message || 'something went wrong'
    error.statuscode= error.statuscode || 500
    return res.status(error.statuscode).json(
           {
            status:error.status, 
            message: error.message,
            stack:  error.stack,
            error
           }
       )

}

function proderror (error, res) {
    
if(error.isOperational){

        error.status=error.statuscode>=400 && error.statuscode<500? 'fail':'error'
        error.message= error.message || 'something went wrong'
        error.statuscode= error.statuscode || 500
        return res.status(error.statuscode).json(
               {
                success: false, 
                status: error.status,  
                message: error.message,
               }
           )
        }else{
          return res.status(500).json({
                success: false,
                status: 'error',
                message:'Something went wrong'
            })
        }

}


const errorHandler= (error, req, res, next)=>{

    if(process.env.NODE_ENV==='development')
    {

        deverror(error, res);
    
    }
    else if(process.env.NODE_ENV==='production')
    {
        
        proderror(error, res);

    }


    fileDeleteFunctionOnError(req);

//     if(req.files && typeof req.files==='object')
// {
    
//     const avatarfilepath=req.files?.avatar? req.files.avatar[0].path : '';
//     const coverimagefilepath=req.files?.coverimage? req.files.coverimage[0].path : '';
//     if((avatarfilepath && coverimagefilepath) || avatarfilepath){fileDeleteFunction(avatarfilepath, coverimagefilepath);}
// }

// if(req.file){

//     if(req.file?.fieldname==='avatar'){
    
//         const avatarfilepath= req.file?.path
//         fileDeleteFunction(avatarfilepath)
//     }else if (req.file?.fieldname==='coverimage'){
//         const coverimagefilepath= req.file?.path
//         fileDeleteFunction(coverimagefilepath)
//     }
// }

//used the asynchronous version of fs.unlink (CHECK_THE_FILE) to offload to thread pool/background.
}

export {errorHandler}