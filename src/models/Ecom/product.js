import mongoose, {Schema} from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
import validator from 'validator';
import { fileDeleteFunction } from '../../utils/helpers/fsFileDelete.js';
import { v2 as cloudinary} from 'cloudinary';

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
        default:[],
        validate:[function(arr){
            return arr.length <= 4
        }, "maximum 4 photos are allowed"]
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


productSchema.methods.deleteFromCloudinary= async function(){

    try {   
            const mainImagePath=this.mainImage.localpath?this.mainImage.localpath:null;
            const mainImagepublicId=this.mainImage.publicId?this.mainImage.publicId:null;

            try {
                await fileDeleteFunction(mainImagePath);
            } catch (error) {
                console.log('An error with file delete product '+ error);
            }    
                await cloudinary.uploader.destroy(mainImagepublicId)
            
            
            if(this.subImages.length){

                this.subImages.forEach(async (subImageObj) => {
                        
                    try {
                        await fileDeleteFunction(subImageObj.localpath)
                        await cloudinary.uploader.destroy(subImageObj.publicId)
                    } catch (error) {
                        
                    }
                });


            }
      
            console.log(`files deleted from local and remote storage`)
    }   
    catch (error) {
        
        console.log(error);
            
    }
};




productSchema.plugin(aggregatePaginate);

export const products= mongoose.model("products", productSchema)