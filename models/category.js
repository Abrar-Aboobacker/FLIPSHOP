const mongoose = require ('mongoose')

const addCategory = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
        maxlength:100
    },
    image:{
        type:Array
    },
    access:{
        type:Boolean,
        default:true
    },

},{
    timestamps:true
})

module.exports = mongoose.model('category',addCategory)