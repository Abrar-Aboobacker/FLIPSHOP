const mongoose = require('mongoose')
const addressSchema = new mongoose.Schema({
    address:{
        type:[{
            name:{
                type:String
            },
            mobile:{
                type:Number
            },
            pin:{
                type:Number
            },
            locality:{
                type:String
            },
            addressDetails:{
                type:String
            },
            district:{
                type:String
            },
            state:{
                type:String
            },
            landmark:{
                type:String
            },
            optmob:{
                type:Number
            }
    }]
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"users"

    }
})
addressSchema.methods.editAdd= async function(data,id){
    const address = this.address
    const Existing= await address.findIndex(obj=>obj._id==id)
    address[Existing]=data
    return this.save()
}

module.exports=mongoose.model('address',addressSchema)