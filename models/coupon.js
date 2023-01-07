const mongoose =require('mongoose')

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true   
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
    userUsed: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
          },
        },
      ],
})
module.exports =mongoose.model('coupons',couponSchema)