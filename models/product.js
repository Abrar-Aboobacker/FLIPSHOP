const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    category: {
        // type: Schema.Types.ObjectId,
        // ref: "ProductSubCategory",
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
      is_deleted: {
        type: Boolean,
        default: false,
      },
      stock: Number,
      imgUrl: { type: [String] },
      description: String,
      created_date: Date,
      modified_date: Date,
      deleted_date: Date,
})
module.exports= mongoose.model('products',productSchema)