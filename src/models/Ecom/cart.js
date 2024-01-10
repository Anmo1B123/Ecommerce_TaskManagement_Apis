import mongoose, {Schema} from 'mongoose'

const itemSchema= new Schema({

product:{

type:Schema.Types.ObjectId,
ref:"products"

},

quantity:{
    type:Number,
    default:1,
    min:[1, 'Quantity cannot be less than 1'],
}

})



const cartSchema= new Schema({

    owner:{
        type:Schema.Types.ObjectId,
        ref:"users"
    },
    items:{
        type:[itemSchema],
        default:[]    
    },
    coupon:{
        type:Schema.Types.ObjectId,
        ref:"coupons",
        default:null
    }


},{timestamps:true});


export const cart= mongoose.model("cart", cartSchema);