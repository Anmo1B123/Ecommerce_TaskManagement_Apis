import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcrypt';
import jwt from'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'


const userSchema= new Schema ({

    username:{
        type:String,
        required: [true, 'username is a required field'],
        lowercase: true, 
        trim: true,
        unique:true,
        min: 2
    },firstname:{
        type:String,
        required: [true, 'firstname is a required field'],
        lowercase: true, 
        trim: true
    },lastname:{
        type:String,
        required: [true, 'lastname is a required field'],
        lowercase: true, 
        trim: true
    },email:{
        type:String,
        required: [true, 'email is a required field'],
        lowercase: true, 
        trim: true,
        validate:{
            validator: function(value){
                return /\S+@\S+\.\S+/.test(value); // Checks for the presence of @ in the email
            },
            message: props => `${props.value} is not a valid email address!`
                }
    },password:{
        type:String,
        required: [true, 'password is a required field'],
        trim: true,
        min: 5
    },avatar:{
        type:{url:String, uniqueId: String, publicId: String, localpath: String},
        required:true
    },coverimage:{
        type:{url:String, uniqueId: String, publicId: String, localpath: String}
    }

}, {timestamps: true});


userSchema.pre('save', async function(next){
    if (!this.isModified('password')) {
        return next();
    }

this.password= await bcrypt.hash(this.password, 10) 
return next();
});

userSchema.methods.isPasswordCorrect= async function(password){
   
    const response =await bcrypt.compare(password, this.password) 
    return response;
   
};
userSchema.methods.generateToken= function(){
    const token= jwt.sign({
    id: this._id,
    username: this.username,
    email: this.email
 }, process.env.JWT_SECRET,
 {expiresIn: process.env.JWT_EXPIRY}
 )
 return token;
};

userSchema.methods.deleteFromCloudinary= async function(){
try {
    console.log(this.avatar.publicId);
    console.log(this.coverimage.publicId);
        await cloudinary.uploader.destroy(this.avatar.publicId?this.avatar.publicId:null);
        await cloudinary.uploader.destroy(this.coverimage.publicId?this.coverimage.publicId:null);
        fs.unlinkSync(this.avatar.localpath?this.avatar.localpath:null);
        fs.unlinkSync(this.coverimage.localpath?this.coverimage.localpath:null);
        console.log(`files deleted from local and remote storage`)
    } catch (error) {
        console.log(error);
        
    }
    }

    
    



export const users= mongoose.model('users', userSchema );