const mongoose =require('mongoose')
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
        const isExisting=productItems.findIndex(objinItems=>objinItems==products)
        if (isExisting>=0){
            response.status=false
        }else{
            response.status=true;
            productItems.push(products)
        }
        return this.save().then(()=>callback(response))

    }

module.exports=mongoose.model('wishList',wishlistSchema)
