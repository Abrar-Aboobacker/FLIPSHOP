const mongoose = require('mongoose')
const bannerschema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A banner must have a title'],
        unique: true,
      },
      image: {
        type: String,
        // default: 'banner_logo.jpg',
      },
      url: {
        type: String,
      },
      description: {
        type: String,
      },
})
mongoose.exports = mongoose.model('banner',bannerschema)