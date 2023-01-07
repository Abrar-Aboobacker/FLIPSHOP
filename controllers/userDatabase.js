const users =require ('../models/user')
const bcrypt=require('bcrypt')
const products = require ('../models/product')
const orders1 =  require ('../models/orders')
const address = require('../models/address')
const user = require('../models/user')
const Razorpay = require('razorpay');
const { resolve } = require('node:path')
const { log } = require('node:console')
const key_id= process.env.key_id;
const secret_key = process.env.key_secret;
var instance = new Razorpay({
    key_id: key_id,
    key_secret:secret_key
  });
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
            // newOrder
            await orders.save().then(async (response)=>{
           
                prd.cart.items=[]
                prd.cart.totalPrice=null
              await  prd.save()
            //   resolve({status:true})
                resolve(response._id)
            })
        })
    },
    generateRazorpay:(orderId,totalPrice)=>{
        return new Promise ((resolve,reject)=>{
            instance.orders.create({
                amount: totalPrice *100,
                currency: "INR",
                receipt: ""+orderId,
                notes: {
                  key1: "value3",
                  key2: "value2"
                }
              },(err,order)=>{
                if(err){
                    console.log(err + "ivdeno preshnam");

                }else{
                    resolve(order)
                    
                }
              })
        })
    },
    verifyPayment:(details)=>{
        
        return new Promise(async (resolve,reject)=>{
            const {
                createHmac,
              } = await import('node:crypto');
            let hmac = createHmac('sha256',secret_key);
            hmac.update(details.payment.razorpay_order_id+'|'+details.payment.razorpay_payment_id);
            hmac=hmac.digest('hex')
           
            if(hmac==details.payment.razorpay_signature){
                console.log("hy");
                resolve()
            }else{
                console.log("ithanoooooo");
                reject()
            }
            
        })
    },
    changePaymentStatus:(orderId)=>{
        return new Promise (async (resolve,reject)=>{
             orders1.updateOne({_id:orderId},{
                $set:{
                    status:'Placed'
                }
                
            }).then(()=>{
                resolve()
            })
        })
    }
}