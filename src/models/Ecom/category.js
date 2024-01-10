import mongoose from 'mongoose';

const { Schema } = mongoose;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },

    description:{
       type:String,
       required:true,
       trim:true
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },

}, {timestamps: true});

const category = mongoose.model('category', categorySchema);

export { category };


/* The owner field in the above schema if typically for the seller of the product to be
    able to categorize his products for easy access.*/