const mongoose = require ('mongoose');
const product = require('./product');

const userSchema = new mongoose.Schema({
    
    fristName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cPassword:{
        type:String,
        required:true
    },
    access:{
        type:Boolean,
        default:true 
    },
    cart:{
        items:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:product,
            },
            qty:{
                type:Number,
            }
        }],
        totalPrice:Number
    }
})

// userSchema.methods.addToCart = function (products,callBack){
//     let cart = this.cart;
// console.log(products);
//     const isExisting = cart.items.findIndex(objInItems=>
//          new String(objInItems.productId)  == String(products._id) )
//          console.log(isExisting);
//         if(isExisting>=0){
//           cart.items[isExisting].qty+=1
           
//         }else{
//             cart.items.push({productId:products._id,qty:1})
//         }
//         if (!cart.totalPrice){
//             cart.totalPrice=0
//         }
//         cart.totalPrice+=products.price
//         return this.save().then(()=>{
//             callBack()
//         })
// }

userSchema.methods.addToCart = function (products,callBack){
    let cart = this.cart;
    const prId=products._id.toString()
    const isExisting = cart.items.findIndex(objInItems=>objInItems.productId ==prId)
         console.log(isExisting);
        if(isExisting>=0){
          cart.items[isExisting].qty+=1
           
        }else{
            cart.items.push({productId:products._id,qty:1})
        }
        if (!cart.totalPrice){
            cart.totalPrice=0
        }
        cart.totalPrice+=products.price
        return this.save().then(()=>{
            callBack()
        })
        }


module.exports=mongoose.model('users',userSchema)