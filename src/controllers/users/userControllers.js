import fs from 'fs';
import {users} from "../../models/users.js"
import apiResponse from '../../utils/apiResponse.js';
import apiError from '../../utils/apiError.js';
import { uploadOnCloudinary } from "../../middlewares/Handlers/cloudinary.js";
import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js";
import { uniqueIdUserSpecificGenerator } from "../../utils/helpers/uniqueIdGenerator.js";
import { fileDeleteFunction } from '../../utils/helpers/fsFileDelete.js';
import mongoose from 'mongoose';
import { ecomProfile } from '../../models/Ecom/profile.js';
import { apiFeatures } from '../../utils/apiFeatures.js';

const getAllUsers= asyncHandler(async (req, res, next)=>{

// console.log(req.query);
if(Object.keys(req.query).length===0)
{   
    const allUsers=  await users.find().sort('-createdAt').select({ 
    avatar:{ url:true}, 
    coverimage:{url:true},
    username: 1, firstname:1, lastname:1, email:1, password:1, createdAt:1});
    res.status(200).json(new apiResponse(200, 'success', {length:allUsers.length,users:allUsers}));
}
else
{           


        let query= new apiFeatures(users.find(), req.query, users).search().sort().fields().pagination();
        
        console.log('docsCount here' + query.docsCount);

        
        const  documentsCount= await query.docsCount;
        const docsOnThisPage= await query.docsOnthisPage; 
/* FOR GETTING THE ABOVE VALUE HAD TO USE OBJECT.CREATE(this.queryObj) in the pagination() of apiFeatures.js*/
        const data=  await query.queryObj;                
/*TO AVOID THE ERROR OF "QUERY WAS ALREADY EXECUTED" WROTE THE ACTUAL EXECUTION OF THE queryObj 
at the end named LET DATA. Reason- Since query.docsOnthisPage relies on this.querObj check pagination()
of apiFeatures.js so executing query.queryobj earlier than query.docsOnthisPage will not create another 
object from this.queryObj for "this.queryObj.count()" to work as this.queryObj would have gotten executed already*/
           

    apiFeatures.pageErrorfunc(documentsCount, req); //Used static function of apifeatures class
    //will throw an error if skip is gte to documents Count.
        

    res.status(200).json(new apiResponse(200,'success', {Length:documentsCount,page:query.page,limit:query.limit,docsOnThisPage,users:data}));
            
                
      
}    
});


const createNewUser= asyncHandler(async (req, res)=>{
    

        const { username=undefined, firstname=undefined, 
                lastname=undefined, email=undefined, 
                password=undefined, confirmPassword=undefined } = req.body;

        const avatarfilepath=req.files?.avatar? req.files.avatar[0].path : ""; 
        const coverimagefilepath=req.files?.coverimage? req.files.coverimage[0].path : "";

/* if MULTER MIDDLEWARE is set and user is sending the files correctly, the files will be saved locally no matter what.
    SO- proactively implemented a strategy where files will be unlinked/deleted as well while throwing apiErrors
    by creating a separate function name fileDeleteFunction for the same   */
            
if([username, firstname, lastname, 
        email, password, confirmPassword].some((prop)=>{

        return prop===undefined||prop?.trim()===""
    
})) throw new apiError('all fields are required', 400);

  

        const userbyUsername= await users.findOne({username:{$regex: `^${username}$`, $options:'i'}})
                                                    //just like here (regular expression)
        
        if(userbyUsername) throw new apiError('username already taken', 400);
        
                    /*=> at first this if statment didn't seem to work BECAUSE username in the database was getting stored in 
                    lowercase (bcoz of intentionally designing username in userschema in such a way to store lowercase only 
                    $ doCheck /models/users.js $)
                    and username from req.body was coming as user is and will be sending.
                    SO- applied .toLowerCase() to req.body.username 
        
                    OR- we can use regular expression search in mongoose */ 
        
        const userByEmail = await users.findOne({email});
            
        if(userByEmail) throw new apiError('A user with this email already exists, Kindly login', 400);
            
        console.log(avatarfilepath); console.log(coverimagefilepath); console.log(' !paths to the file');
                
                
        if (!avatarfilepath) throw new apiError('avatar field is required', 404);
                                                                      
            
        const avatar= await uploadOnCloudinary(avatarfilepath, "users/avatar");

            const avatarPublicId= avatar.public_id;
            const avatarUrl =avatar?.url;
                   
                   
        const coverimage= await uploadOnCloudinary(coverimagefilepath, "users/coverimage");

            const coverimagePublicId= coverimage?.public_id;
            const coverimageurl =coverimage?.url;
                   
        const uniqueId= uniqueIdUserSpecificGenerator(); //Creating uniqueId by using uuid package//
                   
        const avatarObjFields={ url: avatarUrl?avatarUrl:'', uniqueId, 
                                publicId:avatarPublicId, localpath:avatarfilepath}
                   
        let coverimageObjFields;
            if(coverimageurl)
            { 
                coverimageObjFields={url: coverimageurl?coverimageurl:'', uniqueId, 
                                    publicId:coverimagePublicId, localpath:coverimagefilepath}
            } 

            const user= await users.create({username, firstname, 
                                            lastname, email, password,confirmPassword,
                                            avatar: avatarObjFields, 
                                            coverimage: coverimageObjFields, 
                                            role:req.body.role?req.body.role:undefined })
                    
    if(!user) throw new apiError('Something went wrong while registering the user. Try again later',500)
            
// await user.createEcomProfile(); This method won't work here as create returns a js object not document instance.
    
    await ecomProfile.create({firstname:user.firstname, lastname:user.lastname, owner:user._id})

    res.status(200).json(new apiResponse(200, 'success', user));

});


const getUser= asyncHandler(async (req, res, next)=>{
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id))
    {
       
        throw new apiError('not a valid id', 400)
     
    }
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
   /*one thing should be kept in mind that if there is no multer middleware in use
    before any route handler then you can't use "form-multipart" of postman or thunderclient 
    to get data using req.body - see the comment in routes/userRoutes.js for further clarification.*/  
   
    const avatarfilepath=req.files?.avatar? req.files.avatar[0].path : '';
    const coverimagefilepath=req.files?.coverimage? req.files.coverimage[0].path : '';

    if(!mongoose.Types.ObjectId.isValid(id)) throw new apiError('not a valid id', 400)
    //Checking if valid ObjectId of mongodb is being provided//

    const user=await users.findOne({_id:id});
    // console.log(user)
    
    if(!user) throw new apiError('could not find the user by this id', 400);
        
/* APPLYING A CONDITION IN WHICH USER CAN'T UPDATE USERNAME AND EMAIL WHICH IS ALREADY TAKEN BY SOME1 */

            const {username=undefined, email=undefined}=req.body;
            if(username && !email)
            {
                const userbyUsername= await users.findOne({username});
                if(userbyUsername)throw new apiError('Username in use already',400);
            }
            if(email && !username)
            {
                const userByEmail=await users.findOne({email});
                if(userByEmail)throw new apiError('Email in use already', 400);
            }
            if(username && email)
            {
                const userbyUsername= await users.findOne({username});
                const userByEmail=await users.findOne({email});
            
                if(userbyUsername && userByEmail)throw new apiError('Username & E-mail both in use already',400);
                if(userbyUsername && !userByEmail)throw new apiError('Username in use already',400);
                if(!userbyUsername && userByEmail)throw new apiError('Email in use already',400);
            }

            const avatar= await uploadOnCloudinary(avatarfilepath);

            const avatarPublicId= avatar?.public_id;
            const avatarUrl =avatar?avatar.url:undefined;
            
           
            const coverimage= await uploadOnCloudinary(coverimagefilepath);

            const coverimagePublicId= coverimage?.public_id;
            const coverimageurl =coverimage?coverimage.url:undefined;
            
            
            const uniqueId= uniqueIdUserSpecificGenerator();
    
            const dataToUpdate={};
            
            let avatarObjFields;
            if(avatarUrl){

                avatarObjFields       =   {url: avatarUrl?avatarUrl:'', uniqueId, 
                                            publicId:avatarPublicId, localpath:avatarfilepath}
            }
            let coverimageObjFields;    
            if(coverimageurl)
            { 
                coverimageObjFields={url: coverimageurl?coverimageurl:'', uniqueId, 
                                    publicId:coverimagePublicId, localpath:coverimagefilepath}
            } //applied this approach since user may or may not upload coverimage as it's optional.

            Object.assign(dataToUpdate, req.body, {avatar: avatarObjFields, coverimage: coverimageObjFields} )
            // console.log(dataToUpdate)

            const updatedUser= await users.findOneAndUpdate({_id:id}, dataToUpdate, {new:true, runValidators:true});
            // console.log(updatedUser)

            if(updatedUser)
            {
                res.status(200).json(new apiResponse(200,'success', updatedUser));
            }
            else
            {
                throw new apiError(`something went wrong=> couldn't complete the request`, 500);
            }
        
    
});


const deleteUser= asyncHandler(async (req, res, next)=>{
    const {id}= req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
       
        throw new apiError('not a valid id', 400)
        
    }

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


const getCurrentUser= asyncHandler(async (req,res)=>{

const user= await users.findById(req.user?._id);

if(!user) throw new apiError('user not found', 404);

res.status(200).json(new apiResponse(200, 'Success', user))

});


const updatePassword= asyncHandler(async (req,res)=>{

  const user= await users.findById(req.user?._id);
  if(!user) throw new apiError('unauthorized request',401);  

const {oldPassword=undefined, newPassword=undefined, confirmPassword=undefined} = req.body;

if([oldPassword, newPassword, confirmPassword].some((prop)=>{

    return prop?.trim()==="" || prop===undefined

})) throw new apiError('old and new password field is required', 400);


if(newPassword !== confirmPassword) throw new apiError('new password and confirm password fields do not match',400);

    const response = await user.isPasswordCorrect(oldPassword)

if(!response) throw new apiError('Wrong old password typed. Kindly type the correct Password',400);

user.password=newPassword;
user.confirmPassword=confirmPassword;
user.passwordChangedAt=Date.now();

//We could further make a logic for keeping the session or logging him out on his request and as per the frontend logic.
await user.save();

res.status(200).json(new apiResponse(200, 'Password has been updated'))

});


const updateAvatar= asyncHandler(async(req, res)=>{

const user= await users.findById(req.user?._id)
if(!user) throw new apiError('unauthorized request',401);

console.log(req.file);
const avatarfilepath = req.file?.path

if(!avatarfilepath) throw new apiError('An Image for Avatar is required', 400);

const response = await uploadOnCloudinary(avatarfilepath, "users/avatar")
if(!response) throw new apiError('Something went wrong while updating the avatar. Try again later',500)

const uniqueId= uniqueIdUserSpecificGenerator();

const avatarFields={

    url: response?.url,
    localpath:avatarfilepath,
    uniqueId,
    publicId:response?.public_id
}

    user.avatar=avatarFields;
    user.save({validateBeforeSave:false})

    res.status(200).json(new apiResponse(200, 'avatar updated!'))

});


const updateCoverImage= asyncHandler(async(req,res)=>{

    const user= await users.findById(req.user?._id)
if(!user) throw new apiError('unauthorized request',401);

// console.log(req.file);
const coverimagefilepath = req.file?.path

if(!coverimagefilepath) throw new apiError('A coverimage is required to update', 400);

const response = await uploadOnCloudinary(coverimagefilepath, "users/coverimage")
if(!response) throw new apiError('Something went wrong while updating the coverimage. Try again later',500)

const uniqueId= uniqueIdUserSpecificGenerator();

if(response){
const coverimageFields={

    url: response?.url,
    localpath:coverimagefilepath,
    uniqueId,
    publicId:response?.public_id
}
    
    user.coverimage=coverimageFields;
    user.save({validateBeforeSave:false})
}
    res.status(200).json(new apiResponse(200, 'Coverimage updated!'))


});


const deleteCoverImage= asyncHandler(async(req,res)=>{

    const user = await users.findById(req.user._id);
    if(!user) throw new apiError('unauthorized request', 401)

    if(!user.coverimage) throw new apiError('coverimage does not exist to delete', 400);

    try {
        
        await user.deleteCoverImageFromCloudinary();
        
    } catch (error) {
        
        
    }
    
    user.coverimage=undefined;
    await user.save({validateBeforeSave:false});
    res.status(200).json(new apiResponse(200, 'Coverimage deleted successfully'))

})


export {getAllUsers,createNewUser,getUser,updateUser,getCurrentUser,
        deleteUser,updatePassword,updateAvatar,updateCoverImage, deleteCoverImage};