const mongoose =require('mongoose')

const couponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        
    },
    isPercent:{
        type:Boolean,
    },
    amount:{
        type:Number,
        required: true,
    },
    createdAt:{
        type:Date,
    },
    expireDate:{
        type:Date,
        required:true
    },
    usageLimit:{
        type:Number
    },
    minCartAmount:{
        type:Number,
        required:true
        
    },
    maxDiscountAmount:{
        type:Number
    },
    access:{
        type:Boolean,
        default:true
    },

})
module.exports =mongoose.model('coupons',couponSchema)