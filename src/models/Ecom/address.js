import mongoose, {Schema} from 'mongoose'

const addressSchema = new Schema({
    addressLine1: {
        type: String,
        required: true,
        trim:true
    },
    addressLine2: {
        type: String,
        trim:true
    },
    street: {
        type: String,
        required: true,
        trim:true
    },
    city: {
        type: String,
        required: true,
        trim:true
    },
    state: {
        type: String,
        required: true,
        trim:true
    },
    country: {
        type: String,
        required: true,
        trim:true
    },
    postalCode: {
        type: String,
        required: true,
        trim:true
    },

    owner:{
        type:Schema.Types.ObjectId,
        ref:"users"
    }
}, {timestamps:true});

export const address = mongoose.model('address', addressSchema);


