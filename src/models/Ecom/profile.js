import mongoose, {Schema} from 'mongoose';


const userProfileSchema = new Schema({

firstname:{
    type:String,
    trim:true,
    required:true,

},
lastname:{
    type:String,
    trim:true,
    
},

countryCode:{
    type:String,
    trim:true,
    // required:true,
},

phoneNumber:{
    type:String,
    trim:true,
    // required:true,
    // unique:true
},

alternatePhoneNumber:{
    type:String,
    trim:true,
    // required:true,
    // unique:true
},


address:{
    type:Schema.Types.ObjectId,
    ref: 'address'
    
},

owner:{
    type:Schema.Types.ObjectId,
    ref: 'users',
    required:true
},

},{timestamps: true});

export const ecomProfile= mongoose.model("ecomProfile", userProfileSchema);