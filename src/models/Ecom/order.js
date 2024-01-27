import mongoose,{Schema} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const orderSchema = new Schema({
    
customer:{
    type: Schema.Types.ObjectId,
    ref: 'users',
    required:true
},

orderTotal: {
    type: Number,
    default: 0,
},

discountedOrderTotal: {
    type:Number,
    required: true
},

coupon: {
    type: Schema.Types.ObjectId,
    ref: 'coupon',
    default: null
},

items:{
    type:[
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'products',
            },
            quantity:{
                type: Number,
                default: 1,
                min:[1, "quantity can't be less than 1"]
            }
        }
    ],
    default: []
},

address: {
    type: Schema.Types.ObjectId,
    ref: 'address',
    required:true
},

status: {
    type: String,
    enum:["PENDING", "CANCELLED", "DELIVERED"],
    default: "PENDING"
},

paymentProvider:{
    type: String,
    enum:["UNKNOWN", "RAZORPAY", "STRIPE"],
    default: "UNKNOWN"
},

paymentId:{
    type: String,
},

isPaymentDone:{
    type: Boolean,
    default: false
}

});

orderSchema.plugin(mongooseAggregatePaginate);

export const order = mongoose.model("order", orderSchema);