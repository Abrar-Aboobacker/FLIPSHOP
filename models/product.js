const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    category: {
         ref: "category",
        type:String
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      stock:{
        type: Number,
        required:true,
      },
      discount:{
        type:String,
      },
      size:{
        type:Number,
        required:true,
      },
      is_deleted: {
        type: Boolean,
        default: false,
      },
      stock: Number,
      image:{
        type:Array,
        required:true
      },
      description: String,
      created_date: Date,
      modified_date: Date,
      deleted_date: Date,
})
module.exports= mongoose.model('products',productSchema)