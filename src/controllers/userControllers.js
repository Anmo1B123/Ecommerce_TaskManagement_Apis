import fs from 'fs';
import {users} from "../models/users.js"
import apiResponse from '../utils/apiResponse.js';
import apiError from '../utils/apiError.js';
import { uploadOnCloudinary } from "../middlewares/cloudinary.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { uniqueIdUserSpecificGenerator } from "../utils/uniqueIdGenerator.js";
import { fileDeleteFunction } from '../utils/fsFileDelete.js';
import mongoose from 'mongoose';
import { apiFeatures } from '../utils/apiFeatures.js';

const getAllUsers= asyncHandler(async (req, res, next)=>{

// console.log(req.query);
if(Object.keys(req.query).length===0)
{   const totalDocs=await users.find().count()
    const allUsers=  await users.find().sort('-createdAt').select({ 
    avatar:{ url:true}, 
    coverimage:{url:true},
    username: 1, firstname:1, lastname:1, email:1, password:1, createdAt:1});
    res.status(200).json(new apiResponse(200, 'success', {length:totalDocs,users:allUsers}));
}
else
{           


            let query= new apiFeatures(users.find(), req.query).filter().sort().fields().pagination();
        
            console.log('docsCount here' + query.docsCount);
            // console.log('limit'+ query.limit);
            // console.log('page'+ query.page);
            

            // query= query.sort();
            // query= query.fields();
            // query= query.pagination();
            // console.log(query.sort)
        //    query= query.sort().pagination().fields();
        //    console.log(await query)

            
            let data=  await query.queryObj;

            
            // console.log(data)
            
           let  documentsCount= await query.docsCount;

            apiFeatures.pageErrorfunc(documentsCount, req);
           


            // let docsOnThisPage=query.docsOnThisPage;
            // docsOnThisPage=await docsOnThisPage;

            

            res.status(200).json(new apiResponse(200,'success', {documentsCount,page:query.page,limit:query.limit,users:data}));
            
                
//                 let page= parseInt(req.query.page) || 1;
//                 let limit= parseInt(req.query.limit) ||5;
//                 console.log(limit);
//                 let sort= req.query.sort || '-createdAt';
//                 console.log('sort is '+sort)
//                 let select=req.query.select || undefined;
//                 let username= req.query.username || undefined;
//                 if(username) username=username.toLowerCase()
//                 let firstname= req.query.firstname || undefined;

//                 // console.log(typeof firstname)
//                 let lastname= req.query.lastname || undefined;
//                 let email= req.query.email || undefined;
//                 let coverimage= req.query.coverimage ||undefined;
               
              
                    
             

//                 // .where('username').equals(username).where('firstname').equals(firstname)
//                 // .where('lastname').equals(lastname)
//                 // .where('email').equals(email)

//               const Length=await users.find().count();

//               const skip= (page-1)*limit;
    
//     if (username !== undefined && firstname !== undefined && lastname !== undefined && email !== undefined) {
//         const data= await users.find({username,email,firstname,lastname}).skip(skip).limit(limit).sort(sort).select(select);
//         const countOfDocsAsPerQuery =await users.find({username,email,firstname,lastname}).count()
//         res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (username !== undefined && lastname !== undefined && email !== undefined) {
//         const data= await users.find({username,email,lastname}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({username,email,lastname}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (username !== undefined && firstname !== undefined && email !== undefined) {
//         const data= await users.find({username,email,firstname}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({username,email,firstname}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (username !== undefined && firstname !== undefined && lastname !== undefined) {
//         const data= await users.find({username,firstname,lastname}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({username,firstname,lastname}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (username !== undefined && email !== undefined) {
//         const data= await users.find({username,email}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({username,email}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (username !== undefined && firstname !== undefined) {
//         const data= await users.find({username,firstname}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({username,firstname}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (username !== undefined && lastname !== undefined) {
//         const data= await users.find({username,lastname}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({username,lastname}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (firstname !== undefined && lastname !== undefined && email !== undefined) {
//         const data= await users.find({firstname,lastname,email}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({firstname,lastname,email}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (lastname !== undefined && email !== undefined) {
//         const data= await users.find({lastname,email}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({lastname,email}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (firstname !== undefined && email !== undefined) {
//         const data= await users.find({email,firstname}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({email,firstname}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (firstname !== undefined && lastname !== undefined) {
//         const data= await users.find({firstname,lastname}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({firstname,lastname}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (firstname !== undefined) {
//         const data= await users.find({firstname:{$regex: `^${firstname}$`, $options:'i'}}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({firstname:{$regex: `^${firstname}$`, $options:'i'}}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (lastname !== undefined) {
//         const data= await users.find({lastname}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({lastname}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (email !== undefined) {
//         const data= await users.find({email}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({email}).count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else if (username !== undefined) {
//         const data= await users.find({username}).skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find({username}).count()
//    console.log(countOfDocsAsPerQuery)
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//       } 
//       else {
//         if(limit || sort || page){
//             const data= await users.find().skip(skip).limit(limit).sort(sort).select(select);
//    const countOfDocsAsPerQuery =await users.find().count()
//    res.json({Length,TotalDocsResult:countOfDocsAsPerQuery,limit,page, data})
//         }


//       }
      
}    
});

const createNewUser= asyncHandler(async (req, res)=>{
    

const{username=undefined, firstname=undefined, lastname=undefined, email=undefined, password=undefined, confirmPassword=undefined}= req.body /*|| {
username:undefined, firstname:undefined, lastname:undefined, email:undefined, password:undefined}*/ //CAN ALSO USE THIS APPROACH

        const avatarfilepath=req.files?.avatar? req.files.avatar[0].path : ""; 
        /*fetched Localpaths to the file uploaded by multer middleware                                                               
        in advance at top-most level to be further used when necessary here.*/
        const coverimagefilepath=req.files?.coverimage? req.files.coverimage[0].path : "";

/* if MULTER MIDDLEWARE is set and user is sending the files correctly, the files will be saved locally no matter what.
    SO- proactively implemented a strategy where files will be unlinked/deleted as well while throwing apiErrors
    by creating a separate function name fileDeleteFunction for the same   */
if([username, firstname, lastname, email, password, confirmPassword].some((prop)=>{return prop===undefined||prop?.trim()===""}))
{
    
    // if(avatarfilepath || coverimagefilepath){fileDeleteFunction(avatarfilepath, coverimagefilepath);}
    //It means call the file delete function only when the paths exist.
    throw new apiError('all fields are required', 400);
}
else
{   

    
       
        const userbyUsername= await users.findOne({username:{$regex: `^${username}$`, $options:'i'}})
                                                    //just like here (regular expression)
        
        if(userbyUsername)
        {
            // if(avatarfilepath || coverimagefilepath){fileDeleteFunction(avatarfilepath, coverimagefilepath);}
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
            
            if(userByEmail)
            {
                // if(avatarfilepath || coverimagefilepath){fileDeleteFunction(avatarfilepath, coverimagefilepath);}
                throw new apiError('A user with this email already exists, Kindly login', 400);
            }
            else
            {
                console.log(avatarfilepath); console.log(coverimagefilepath); console.log(' !paths to the file');
                if (!avatarfilepath)
                { 
                    // if(avatarfilepath || coverimagefilepath){fileDeleteFunction(avatarfilepath, coverimagefilepath);}
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
                                                                DOESN'T EVEN MAKE ANY DIFFERENCE*/
               {
                   const avatar= await uploadOnCloudinary(avatarfilepath);
                   const avatarPublicId= avatar.public_id;
                   const avatarUrl =avatar?.url;
                   
                   
                   const coverimage= await uploadOnCloudinary(coverimagefilepath);
                   const coverimagePublicId= coverimage?.public_id;
                   const coverimageurl =coverimage?.url;
                   
                   const uniqueId= uniqueIdUserSpecificGenerator(); //Creating uniqueId by using uuid package//
                   
                   
                   const avatarObjFields={url: avatarUrl?avatarUrl:'', uniqueId, publicId:avatarPublicId, localpath:avatarfilepath}
                   
                   let coverimageObjFields;
                   if(coverimageurl)
                   { 
                       coverimageObjFields={url: coverimageurl?coverimageurl:'', uniqueId, 
                                           publicId:coverimagePublicId, localpath:coverimagefilepath}
                   } 
/*coverimage field will exist only if uploaded by user, 
        applied this approach since user may or may not upload coverimage as it's optional.
            also using coverimageurl in IF CONDITION because upon successful upload of files on cloudinary 
we get the url and that url is our condition if true upon which we will create the coverimage field in schema 
                   */
                   


                   let user= await users.create({username, firstname, 
                                                lastname, email, password,confirmPassword,
                                                avatar: avatarObjFields, 
                                                coverimage: coverimageObjFields, role:req.body.role?req.body.role:undefined })
                    res.status(200).json(new apiResponse(200, 'success', user))
                }   
                
            }    
                
        }
            
    }
    // else
    // {   
    //     // if(avatarfilepath || coverimagefilepath){fileDeleteFunction(avatarfilepath, coverimagefilepath);}
    //     throw new apiError('email requires @ symbol, kindly check the email provided', 400)
    // }

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
    // console.log(req.files);
    /* console.log(req.body); -Just for checking the body - 

    one thing should be kept in mind that if there is no multer middleware in use
    before any route handler then you can't use "form-multipart" of postman or thunderclient 
    to get data using req.body - see the comment in routes/userRoutes.js for further clarification.*/  
   
    const avatarfilepath=req.files?.avatar? req.files.avatar[0].path : '';
    const coverimagefilepath=req.files?.coverimage? req.files.coverimage[0].path : '';


    if(!mongoose.Types.ObjectId.isValid(id)){
        if(avatarfilepath || coverimagefilepath){fileDeleteFunction(avatarfilepath, coverimagefilepath);}
        //It means call the file delete function only when the paths exist.
        throw new apiError('not a valid id', 400)
        
    } //Checking if valid ObjectId of mongodb is being provided//

    const user=await users.findOne({_id:id});
    console.log(user)
        if(!user)
        {   
            if(avatarfilepath || coverimagefilepath){fileDeleteFunction(avatarfilepath, coverimagefilepath);}
            throw new apiError('could not find the user by this id', 400);
        }
        else
        {   /* Applying a condition in which user can't update username and email which is already taken by some1*/

            const {username=undefined, email=undefined}=req.body;
            if(username && !email)
            {
                const userbyUsername= await users.findOne({username});
                if(userbyUsername)throw new apiError('Username in use already. Choose different username',400);
            }
            if(email && !username)
            {
                const userByEmail=await users.findOne({email});
                if(userByEmail)throw new apiError('Email in use already', 400);
            }
            if(username && email){
                const userbyUsername= await users.findOne({username});
                const userByEmail=await users.findOne({email});
                // if(userbyUsername)throw new apiError('Username in use already. Choose different username',400);
                // if(userByEmail)throw new apiError('Email in use already', 400);
                if(userbyUsername && userByEmail)throw new apiError('Username & E-mail both in use already',400);
            }
            const avatar= await uploadOnCloudinary(avatarfilepath);
            const avatarPublicId= avatar?.public_id;
            const avatarUrl =avatar?avatar.url:undefined;
    
            const coverimage= await uploadOnCloudinary(coverimagefilepath);
            const coverimagePublicId= coverimage?.public_id;
            const coverimageurl =coverimage?coverimage.url:undefined;
    
            const uniqueId= uniqueIdUserSpecificGenerator();
    
            const dataToUpdate={}; /*creating an empty object to merge all the properties of 
                                    req.body and req.files into the empty object and then using
                                    the same object to further update the user in mongoDB*/
    
            const avatarObjFields       =   {url: avatarUrl?avatarUrl:'', uniqueId, 
                                            publicId:avatarPublicId, localpath:avatarfilepath}

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
                if(avatarfilepath || coverimagefilepath){fileDeleteFunction(avatarfilepath, coverimagefilepath);}
                throw new apiError(`something went wrong=> couldn't complete the request`, 500);
            }
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



export {getAllUsers,createNewUser,getUser,updateUser,deleteUser};