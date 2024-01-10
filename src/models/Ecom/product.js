import mongoose, {Schema} from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const productSchema= new Schema({

    name:{
        type:String,
        required: true,
        trim:true
    },

    description:{
        type:String,
        required:true,
        trim:true
    },

    price:{
        type:Number,
        default:0
    },

    stock:{
        type:Number,
        default:0
    },

    mainImage:{
        type:{
        url:String,
        publicId:String,
        localpath:String,
        },
        required:true
    },

    subImages:{
        type:[{
        url:String,
        publicId:String,
        localpath:String
        }],
        default:[]
    },

    seller:{
        type:Schema.Types.ObjectId,
        ref:"users",
        required:true
    },

    preDefinedCategories:{
        type:[String],
        required:true
    },

    sellerDefinedCategory:{
        type:Schema.Types.ObjectId,
        ref:"category",
        required:true
    }
    
}, {timestamps:true});


productSchema.plugin(aggregatePaginate);

export const products= mongoose.model("products", productSchema)