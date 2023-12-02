import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
          
cloudinary.config({
  cloud_name: 'dcxj9leka',
  api_key: '381578751879179',
  api_secret: 'rpfLJyjUQcM4P-7R4ezqawxc4eI',
  secure: true,
});

export const uploadOnCloudinary= async function(localfilepath, public_id){
    try {
        if (localfilepath) {const response = await cloudinary.uploader.upload(localfilepath, {public_id,resource_type: "auto"});
        console.log('file uploaded sucessfully', response?.url + `that is the url`);
        
    return response;}
        
        else{ console.log(`couldn't upload on cloudinary 
        SO -
        `)}
        
        
    } catch (error) {
        fs.unlinkSync(localfilepath);
        console.log('file removed due to error')
        return null;

    }
    
};