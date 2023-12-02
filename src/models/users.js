import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcrypt';
import jwt from'jsonwebtoken';


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
        lowercase: true, 
        trim: true,
        min: 5
    },avatar:{
        type: String
    },coverimage:{
        type: String
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
     jwt.sign({
    id: this._id,
    username: this.username,
    email: this.email
 }, process.env.JWT_SECRET,
 {expiresIn: JWT_EXPIRY}
 )
};

export const users= mongoose.model('users', userSchema );