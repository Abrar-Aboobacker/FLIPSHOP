const mongoose = require('mongoose')

const bannerCchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A banner must have a title'],
        unique: true,
      },
      mainTitle:{
        type:String,
        required:true
      },
      image: {
        type: Array,
        // default: 'banner_logo.jpg',
      },
      url: {
        type: String,
      },
      description: {
        type: String,
      },
      access:{
        type:Boolean,
        default:true
    },
})
module.exports = mongoose.model('banner',bannerCchema)