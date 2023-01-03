const users =require ('../models/user')
const bcrypt=require('bcrypt')
const products = require ('../models/product')
const orders1 =  require ('../models/orders')
const address = require('../models/address')
const user = require('../models/user')

// var salt = bcrypt.genSaltSync(10)
// var hash = bcrypt.hashSync("B4c0/\/", salt);

module.exports={
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let user=await users.findOne({email:userData.email})
            
            if(user && user.access){
                
                bcrypt.compare(userData.pass,user.password).then((status)=>{
                    if(status){
                        response.user=user
                        response.status=true
                        resolve(response)
                        console.log('success');
                    }else{
                        resolve({status:false})
                        console.log('failed');
                    }
                })
            }else{
                resolve({status:false})
                console.log('didnt exist');
            }
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{   
            const product = await  products.find().where()
            resolve(product)
        })
    },

    placeOrder:(order)=>{
        return new Promise(async (resolve,reject)=>{
            const prd = await users.findOne({_id:order.userId})
            console.log(prd.cart.items);
            const status = order.payment== 'cod'?'Placed':'Pending'
            const orders = new orders1({
                userid:order._id,
                total:prd.cart.totalPrice,
                payment:order.payment,
                address:order.address,
                products:prd.cart,
                status,
                date:new Date()
            })
            await orders.save().then(async (newOrder)=>{
           
                prd.cart.items=[]
                prd.cart.totalPrice=null
              await  prd.save()
            })
        })
    }
}