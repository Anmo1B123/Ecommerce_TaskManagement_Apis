import mongoose, {Schema} from 'mongoose';


const contactSchema= new Schema({
name: {type: String,
        required:true,    
}, 
    
address: {type: String,     
}, 
    
phone: {type: number,
        required:true,
        unique:true      
},

createdBy: {type: mongoose.Schemas.Types.ObjectId,
        ref: 'users',
        required:true 
}
}, {timestamps: true});


const contacts= mongoose.model('contacts', contactSchema);