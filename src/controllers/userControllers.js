import {users} from "../models/users.js"
import apiResponse from '../utils/apiResponse.js';
import apiError from '../utils/apiError.js';
import { uploadOnCloudinary } from "../middlewares/cloudinary.js";

const getAllUsers= async(req, res, next)=>{

    const users=await users.find();
    res.status(200).json(new apiResponse(200, 'success', users));

};


const createNewUser= async (req, res, next)=>{
    try {
        const {username, firstname, lastname, email, password}= req.body || {
            username:undefined, firstname:undefined, lastname:undefined, email:undefined, password:undefined
        }

               
                if ([username, firstname, lastname, email, password].some((prop)=>{
                return prop===undefined || prop?.trim()===""
                })){throw new apiError('all fields are required', 400);}
                else{
                
            
                const avatarfilepath=req.files?.avatar? req.files.avatar[0].path : "";
                const coverimagefilepath=req.files?.coverimage? req.files.coverimage[0].path : "";
                console.log(avatarfilepath, coverimagefilepath + ' <=paths to the file');
                if (!avatarfilepath){ 
                    throw new apiError('avatar field is required', 404);
                }
                const avatar= await uploadOnCloudinary(avatarfilepath, 'avatar');
                const avatarUrl =avatar?.url;
        
        
        
                
                    
                if (!coverimagefilepath){ 
                return null;
                }
                 const coverimage= await uploadOnCloudinary(coverimagefilepath, 'coverimage');
                 const coverimageUrl =coverimage?.url;

        let user= await users.create({username, firstname, lastname, email, password, avatar: avatarUrl?avatarUrl:'' , coverimage: coverimageUrl?coverimageUrl:'' })
        res.status(200).json(new apiResponse(200, 'success', user))
        
        
    }
    } catch (error) {
        next(error);
    }
 
};
// const createNewUser = async (req, res, next) => {
//     try {
//         const propArr = ["username", "firstname", "lastname", "email", "password"];
//         const missingFields = [];

//         propArr.forEach((prop) => {
//             if (req.body[prop] === undefined || req.body[prop] === '') {
//                 missingFields.push(prop);
//             }
//         });

//         if (missingFields.length > 0) {
//             throw new ApiError(`Fields are missing: ${missingFields.join(', ')}`, 400);
//         } else {
//             let user = await users.create(req.body); // Using await to get the user from the promise
//             res.status(200).json(new apiResponse(200, 'success', user));
//         }
//     } catch (error) {
//         next(error);
//     }
// };


const getUser= async (req, res, next)=>{

};


const updateUser= async (req, res, next)=>{

};


const deleteUser= async (req, res, next)=>{
 
};



export {getAllUsers,createNewUser,getUser,updateUser,deleteUser};