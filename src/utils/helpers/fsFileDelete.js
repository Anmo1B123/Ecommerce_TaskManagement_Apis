import { v2  as cloudinary} from 'cloudinary'
import fs from'fs'
import util from 'util'


export const fileDeleteFunction= async (path1, path2)=>{

    const fsUnlink = util.promisify(fs.unlink)

if(path1 && !path2)
{  
    await fsUnlink(path1)
}
else if(path2 && !path1)
{
    await fsUnlink(path2) 
}
else if(path1 && path2)
{
    fsUnlink(path1);
    fsUnlink(path2);
}
else
{
    console.log('no path was provided for deletion')
}

}

export const cloudinaryFileDestroyer = async (public_Ids)=>{

    try {
        if(typeof public_Ids ==='string'){
    
            await cloudinary.uploader.destroy(public_Ids)
    
        }else if(typeof public_Ids ==='object' && Array.isArray(public_Ids)){
    
            public_Ids.forEach(async (publicId)=>await cloudinary.uploader.destroy(publicId))
        }
    } catch (error) {
        console.log(error);
        
    }
}


export const fileDeleteFunctionOnError = (req)=>{

    if (req.file || req.files) {

        const multerPath = req.file?.path
        const multerPathArray=[];
        if(req.files !== undefined){ 
            
            if(typeof req.files==='object'){

                if(!Array.isArray(req.files)){
                
                    const valuesArr= Object.values(req.files)

                        valuesArr.forEach((innerArr)=>{
                    
                            innerArr.forEach((innerArrFileObject)=>{
                            
                                multerPathArray.push(innerArrFileObject.path)

                            })

                        });
                }
                else{
                    if(req.files.length > 0){
                    req.files.forEach((fileObj)=>{

                        multerPathArray.push(fileObj.path);

                    })
                    }

                }
            }

        }

        if(multerPath) fileDeleteFunction(multerPath).then();
        if(multerPathArray.length !== 0){

            multerPathArray.forEach(async (path)=> await fileDeleteFunction(path))
            
        }

    }    
    if(req.cloudinaryPublicIds?.length){

        req.cloudinaryPublicIds.forEach(async (publicIds)=> await cloudinary.uploader.destroy(publicIds))
    }


}



/****************************************/
/* DATE-08/12/2023

    Everything was working fine with this function until I decided to solve more potential corner cases-
    I noticed that this function was throwing errors 
    ERROR- path not correct/""this is not a path. etc. when null/undefined/emptystrings were being passed 
    in the arguments of this function.

    So, decided to add some if conditionals control inside the function to respond accordingly which stopped the
    errors.
    (OPTIONAL)Also added an additonal if condition to call the function only if one of the path exist
    and rest functionality is being handled here in function's body itself. (in userControllers.js). 


    DATE-25/12/2023

    Made the file delete function to act asynchronously to have it work in the backgroup and not block the main 
    thread due to its former synchronous nature.
*/

