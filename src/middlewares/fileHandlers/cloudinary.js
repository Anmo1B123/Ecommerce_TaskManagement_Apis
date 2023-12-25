import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'


cloudinary.config({
  cloud_name: 'dcxj9leka',             /* not able to use env variables here in config*/ 
  api_key: '381578751879179',
  api_secret: 'rpfLJyjUQcM4P-7R4ezqawxc4eI',
  secure: true,
});

export const uploadOnCloudinary= async function(localfilepath, public_id=undefined){

try{  
                                                                                                 //public_id as an argument will come- would be a string and then that name will be shown on cloudinary
    if (localfilepath){
        
        const response = await cloudinary.uploader.upload(localfilepath, {public_id:public_id,
            resource_type: "auto"});
        if(response)console.log('file uploaded sucessfully', response?.url + ` <=that is the url`);
        
        return response;
    }
    else{ 
        
        console.log(`A file wasn't uploaded on cloudinary as a path wasn't given / multer wasn't used.`);    
        return;
    }
        
        
} catch (error) {

    fs.unlinkSync(localfilepath);
    console.log('Local file removed due to error in Uploading On Cloudinary')
    return;

}
    
};