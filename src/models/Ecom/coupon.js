import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    couponCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    type: {
        type: String,
        enum: ['percent', 'flat'],
        default: 'flat'
    },
    discount: {
        type: Number,
        required: true
    },
    minimumCartValue:{
        type: Number,
        default:0
    },
    startDate: {
        type: Date,
        default: Date.now()
    },
    expiryDate: {
        type: Date,
        default: null
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },

}, {timestamps: true});


couponSchema.plugin(mongooseAggregatePaginate);

export const coupons = mongoose.model('coupons', couponSchema);

