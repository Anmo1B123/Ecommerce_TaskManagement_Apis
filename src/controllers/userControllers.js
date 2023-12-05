import fs from 'fs';
import {users} from "../models/users.js"
import apiResponse from '../utils/apiResponse.js';
import apiError from '../utils/apiError.js';
import { uploadOnCloudinary } from "../middlewares/cloudinary.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { uniqueIdUserSpecificGenerator } from "../utils/uniqueIdGenerator.js";

const getAllUsers= asyncHandler(async (req, res, next)=>{

    const allUsers=  await users.find().select({ 
        avatar:{ url:true}, 
        coverimage:{url:true},
        username: 1, firstname:1, lastname:1, email:1, password:1});
    res.status(200).json(new apiResponse(200, 'success', allUsers));

});


const createNewUser= asyncHandler(async (req, res)=>{
    

const{username=undefined, firstname=undefined, lastname=undefined, email=undefined, password=undefined}= req.body /*|| {
          username:undefined, firstname:undefined, lastname:undefined, email:undefined, password:undefined}*/
console.log(username, firstname);
const avatarfilepath=req.files?.avatar? req.files.avatar[0].path : "";
const coverimagefilepath=req.files?.coverimage? req.files.coverimage[0].path : "";

/* if multer middleware is in set and user is sending the files correctly the files will be saved no matter what
    SO- proactively implemented a strategy where files will be unlinked/deleted as well while throwing apiErrors  */
if([username, firstname, lastname, email, password].some((prop)=>{return prop===undefined||prop?.trim()===""}))
{
    fs.unlinkSync(avatarfilepath);
    fs.unlinkSync(coverimagefilepath); /*BETTER TO CREATE A FUNCTION OF THIS REPITITIVE TASK- THEN DELETE THIS COMMENT*/
    throw new apiError('all fields are required', 400);
}
else
{   

    if(/\S+@\S+\.\S+/.test(email))
    {
        
        const userbyUsername= await users.findOne({ username: { $regex: new RegExp(username, 'i') } });
                                                    //just like here 
        console.log(userbyUsername);
        console.log(username);
        
        if(userbyUsername && username.toLowerCase()===userbyUsername.username){
            fs.unlinkSync(avatarfilepath);
            fs.unlinkSync(coverimagefilepath);
           throw new apiError('username already taken', 400);
        }
                    /*=> at first this if statment didn't seem to work BECAUSE username in the database was getting stored in 
                    lowercase (bcoz of intentionally designing username in userschema in such a way to store lowercase only 
                    $ doCheck /models/users.js $)
                    and username from req.body was coming as user is and will be sending.
                    SO- applied .toLowerCase() to req.body.username 
        
                    OR- we can use regular expression search in mongoose */ 
        else
        {
            
            const userByEmail = await users.findOne({email});
            console.log(userByEmail)
            
            if(userByEmail)
            {
                fs.unlinkSync(avatarfilepath);
        fs.unlinkSync(coverimagefilepath);
                throw new apiError('user already exists, Kindly login', 400);
            }
            else
            {
                
                
                console.log(avatarfilepath); console.log(coverimagefilepath); console.log(' !paths to the file');
                if (!avatarfilepath)
                { 
                    fs.unlinkSync(avatarfilepath);
        fs.unlinkSync(coverimagefilepath);
                    throw new apiError('avatar field is required', 404);
                }                                                       /* NOTE!!
                when writing if statment without the else part
                we use RETURN keyword in if body in order to avoid writing
                else part, but if an error is being thrown you can additonally avoid
                using the RETURN keyword */
                
                /*if (!coverimagefilepath) return null; <= DONT' DO THIS 
                BECAUSE
                it means if there is no coverimagefilepath as in the user didn't upload coverimage while registering
                then it's simply going to return NULL/NOTHING
                and the code written further won't run                                                  
                */
               if (!coverimagefilepath || coverimagefilepath) /* YOU CAN DO THIS INSTEAD. IT'S OPTIONAL.
                                                                DOESN'T EVEN MAKE SENSE*/
               {
                   const avatar= await uploadOnCloudinary(avatarfilepath);
                   const avatarPublicId= avatar.public_id;
                   const avatarUrl =avatar?.url;
                   
                   
                   const coverimage= await uploadOnCloudinary(coverimagefilepath);
                   const coverimagePublicId= coverimage.public_id;
                   const coverimageUrl =coverimage?.url;
                   
                   const uniqueId= uniqueIdUserSpecificGenerator();
                   const avatarObjFields={url: avatarUrl?avatarUrl:'', uniqueId, publicId:avatarPublicId, localpath:avatarfilepath}
                   const coverimageObjFields={url: coverimageUrl?coverimageUrl:'', uniqueId, publicId:coverimagePublicId, localpath:coverimagefilepath}
                   
                   let user= await users.create({username, firstname, lastname, email, password, 
                    avatar: avatarObjFields, 
                    coverimage: coverimageObjFields })
                    res.status(200).json(new apiResponse(200, 'success', user))
                }   
                
            }    
                
        }
            
    }
    else
    {   
        fs.unlinkSync(avatarfilepath);
        fs.unlinkSync(coverimagefilepath);
        throw new apiError('email requires @ symbol, kindly check the email provided', 400)
    }
}
});

const getUser= asyncHandler(async (req, res, next)=>{
    const {id} = req.params
    const user= await users.findById(id);

    if  (user) 
        {
            res.status(200).json(new apiResponse(200, 'success', user));
        } 
    else{   
            throw new apiError('could not find the user', 404)
        }


});


const updateUser= asyncHandler(async (req, res, next)=>{
    const {id}= req.params;
/* console.log(req.body); -Just for checking the body - 

   one thing should be kept in mind that if there is no multer middleware in use
   before any route handler then you can't use "form-multipart" of postman or thunderclient 
   to get data using req.body - see the comment in routes/userRoutes.js for further clarification.

*/
    const avatarfilepath=req.files?.avatar? req.files.avatar[0].path : "";

    const coverimagefilepath=req.files?.coverimage? req.files.coverimage[0].path : "";

    const avatar= await uploadOnCloudinary(avatarfilepath, 'avatar');
    const avatarPublicId= avatar.public_id;
    const avatarUrl =avatar?avatar.url:undefined;
    
    const coverimage= await uploadOnCloudinary(coverimagefilepath, 'coverimage');
    const coverimagePublicId= coverimage.public_id;
    const coverimageurl =coverimage?coverimage.url:undefined;
    
    const uniqueId= uniqueIdUserSpecificGenerator();
    
    const dataToUpdate={}; /*creating an empty object to merge all the properties of 
                            req.body and req.files into the empty object and then using
                            the same object to 
                            further update the user in mongoDB*/
    
    const avatarObjFields={url: avatarUrl?avatarUrl:'', uniqueId, publicId:avatarPublicId, localpath:req.files?.avatar? req.files.avatar[0].path : ""}
    const coverimageObjFields={url: coverimageUrl?coverimageUrl:'', uniqueId, publicId:coverimagePublicId, localpath:req.files?.coverimage? req.files.coverimage[0].path : ""}

    Object.assign(dataToUpdate, req.body, {avatar: avatarObjFields, coverimage: coverimageObjFields} )
    console.log(dataToUpdate)

    const updatedUser= await users.findByIdAndUpdate(id, dataToUpdate, {new:true});
    console.log(updatedUser)

    if(updatedUser) {res.status(200).json(new apiResponse(200,'success', updatedUser)); return}
    throw new apiError(`something went wrong=> couldn't complete the request`, 500 );

});


const deleteUser= asyncHandler(async (req, res, next)=>{
    const {id}= req.params;

    const userById= await users.findById(id)
    if(!userById){throw new apiError(`user by this ID doesn't exist`, 404)}


    await userById.deleteFromCloudinary(); //using the approach of saving public id of cloudinary and localfilePath
                                           // in database and creating a method specific to userschema to apply to user instances
                                           // for deleting the file locally and on cloud when user is deleted.

    const acknowledgement=await users.deleteOne({_id:id});

    console.log(acknowledgement);

    if (acknowledgement) { res.status(200).json(new apiResponse(200, 'success', acknowledgement)); return}
    throw new apiError('could not complete the request', 500);
 
});



export {getAllUsers,createNewUser,getUser,updateUser,deleteUser};