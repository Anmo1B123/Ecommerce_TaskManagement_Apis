import multer from "multer";
import apiError from "../../utils/apiError.js";




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/tmp/my-uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+'-'+ file.originalname)
    }
  });

  const filefilter = (req, file, cb)=>{

    if(file.mimetype.startsWith('video/')) cb(new apiError('videos are not allowed'), null);

    cb(null, true);

  }
  
  export const upload = multer({ storage: storage, fileFilter: filefilter});  