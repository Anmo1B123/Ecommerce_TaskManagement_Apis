import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcrypt';
import jwt from'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
import { fileDeleteFunction } from "../utils/fsFileDelete.js";
import validator from "validator";
import { uniqueIdUserSpecificGenerator } from "../utils/uniqueIdGenerator.js";
import crypto from 'crypto';
import { response } from "express";
import { client } from "../database/redis.js";


const userSchema= new Schema ({

    username:{
        type:String,
        required: [true, 'username is a required field'],
        lowercase: true, 
        trim: true,
        unique:true,
        minlength: 2
    },
    firstname:{
        type:String,
        required: [true, 'firstname is a required field'],
        lowercase: true, 
        trim: true
    },
    lastname:{
        type:String,
        required: [true, 'lastname is a required field'],
        lowercase: true, 
        trim: true
    },
    email:{
        type:String,
        required: [true, 'email is a required field'],
        lowercase: true, 
        trim: true,
        validate: [validator.isEmail, 'Not a valid email-address']
    },
    password:{
        type:String,
        required: [true, 'password is a required field'],
        trim: true,
        minlength: 5,
    },confirmPassword:{
        type:String,
        required:[true, 'confirm password is a required field'],
        validate:
            {
                validator:function(confirmPassword)
                {
                    return confirmPassword===this.password
                },

                message:'Password & confirm-password does not match'
            }
    },
    avatar:{
        type:{url:String, uniqueId: String, publicId: String, localpath: String},
        required:true
    },
    coverimage:{
        type:{url:String, uniqueId: String, publicId: String, localpath: String}
    }, 
    role:{
        type:String,
        enum:['user', 'admin'],
        default: 'user'
    },
    passwordChangedAt:Date
    ,
    passwordChangeToken:String
    ,
    passwordChangeTokenExpiry:Date
    ,
    refreshtoken:String
    ,
    uniqueVersionAccess:String
    ,
    uniqueVersionRefresh:String
    
}, {timestamps: true});


userSchema.pre('save', async function(next){
    if (!this.isModified('password')) {
        return next();
    }

this.password= await bcrypt.hash(this.password, 10) 
this.confirmPassword=undefined;
console.log('a new password has been saved ')
return next();
});

userSchema.methods.isPasswordCorrect= async function(password){
   
    const response =await bcrypt.compare(password, this.password) 
    return response;
   
};
userSchema.methods.generateToken= function(){
    let uniqueV1= uniqueIdUserSpecificGenerator();

    const accessToken= jwt.sign({
                            _id: this._id,
                            username: this.username,
                            email: this.email,
                            role: this.role,
                            __v: uniqueV1
                        }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRY});

    this.uniqueVersionAccess=uniqueV1;

    return {accessToken, uniqueV1};

};

userSchema.methods.generateRefreshToken= function(){
    let uniqueV2= uniqueIdUserSpecificGenerator()
    
    const refreshToken= jwt.sign({
                            _id: this._id,
                            __v: uniqueV2
                        }, process.env.JWT_REFRESHTOKEN_SECRET,{expiresIn: process.env.JWT_REFRESHTOKEN_EXPIRY})
 
    this.refreshtoken=refreshToken;
    this.uniqueVersionRefresh=uniqueV2;

    return {refreshToken, uniqueV2};
};

userSchema.methods.isPasswordChanged= async function(JWTtime) {
    if(!this.isModified('password')) return false
    if(this.passwordChangedAt){
        const passwordchangedtimeMILLISECONDS=parseInt(this.passwordChangedAt.getTime());

        console.log(passwordchangedtimeMILLISECONDS)
        console.log(jwtTimestamp)
        let response= passwordchangedtimeMILLISECONDS > jwtTimestamp
        return response;

    }
 
};

userSchema.methods.deleteFromCloudinary= async function(){
try {   
    if((this.avatar && this.coverimage)||(this.avatar || this.coverimage) ){

        const userAvatarfilepath=this.avatar.localpath?this.avatar.localpath:null;
        const userCoverimagefilepath=this.coverimage?.localpath?this.coverimage?.localpath:null;
        if(userAvatarfilepath || userCoverimagefilepath)
        {
            fileDeleteFunction(userAvatarfilepath,userCoverimagefilepath);
        }
        
        if(this.avatar.publicId && !this.coverimage?.publicId)
        {
            await cloudinary.uploader.destroy(this.avatar.publicId?this.avatar.publicId:null);
            return;
        }
        if(this.coverimage?.publicId && !this.avatar.publicId)
        {
            await cloudinary.uploader.destroy(this.coverimage.publicId?this.coverimage.publicId:null);
            return;
        }
        if(this.avatar.publicId && this.coverimage?.publicId)
        {
            await cloudinary.uploader.destroy(this.avatar.publicId?this.avatar.publicId:null);
            await cloudinary.uploader.destroy(this.coverimage?.publicId?this.coverimage?.publicId:null);
            
        }
        else{
            return;
        }
        
        console.log(`files deleted from local and remote storage`)
    }
    
}   catch (error) {
        console.log(error);
        
}
};

userSchema.methods.generatePasswordResetToken= function (){

   const token = crypto.randomBytes(32).toString('hex') 
   const encryptedToken= crypto.createHash('sha256').update(token).digest('hex');
console.log('users  ' + encryptedToken);
this.passwordChangeToken=encryptedToken;
this.passwordChangeTokenExpiry= Date.now() + 10*60*1000;
return token;   

};
        

export const users= mongoose.model('users', userSchema );