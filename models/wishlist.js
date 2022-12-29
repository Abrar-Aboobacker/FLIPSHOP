const mongoose =require('mongoose')
// const product = require('./product')

const wishlistSchema =  new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
        productItems:[{
            type:mongoose.Types.ObjectId,
            ref:'products'
        }]
   

})
    wishlistSchema.methods.addToWishlist = function(products,callback){
        let productItems = this.productItems
        const response={}
        // const prId= products._id.toString()
        const isExisting=productItems.findIndex(objinItems=>objinItems==products)
        console.log(isExisting);
        if (isExisting>=0){
            console.log('Keerry');
            response.status=false
        }else{
            console.log('Ithil keeery');
            response.status=true;
            productItems.push(products)
        }
        return this.save().then(()=>callback(response))

    }

module.exports=mongoose.model('wishList',wishlistSchema)
