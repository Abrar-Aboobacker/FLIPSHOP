const admins =require('../models/admin')
const category1 = require('../models/category');
const coupons =require ('../models/coupon')
const product = require('../models/product')
const user1 = require ('../models/user.js')
const orders = require('../models/orders')
const banner = require('../models/banner')
const ITEMS_PER_PAGE = 6;
module.exports={
    adminlogin:(admindata)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let admin=await admins.find({email:admindata.email})
            if(admin.length>0){
                if(admindata.password === admin[0].password){
                    response.admin=admin
                    response.status=true
                    resolve(response)
                }else{
                    resolve({status:false})
                }
            }else{
                resolve({status:false})
            }
        })
    },
     getProductDetails:(productId)=>{
        return new Promise((resolve,reject)=>{
            product.findOne({_id:productId}).then((product)=>{
                resolve(product)
            })
        })
    },
    deleteProductDetails:(productId)=>{
        return new Promise((resolve,reject)=>{
            product.deleteOne({_id:productId}).then((response)=>{
                resolve(true)
            })
        })
    },
    getAllProduct:  (callback) => {
            product .find().where().
           exec((err,productList)=>{
               
               callback(err,productList)
             });
         },
    getAllCategory:  (callback) => {

       category1 .find().where().
      exec((err,categoryList)=>{
          
          callback(err,categoryList)
        });
    },
    getAllCoupon:  (callback) => {

        coupons.find().where().
       exec((err,couponList)=>{
           
           callback(err,couponList)
         });
     },
     getCouponDetails:(couponId)=>{
        return new Promise((resolve,reject)=>{
            coupons.findOne({_id:couponId}).then((coupon)=>{
                resolve(coupon)
            })
        })
    },
    getAllUsers:(callback)=>{
        
       user1.find().where().
       exec((err,users)=>{
           
           callback(err,users)
         });
    },
    getAllOrders:  (callback) => 
        orders.find().populate('products.productId').exec((err,orders)=>{
           
           callback(err,orders)
         }),
         getBannerDetails:(bannerId)=>{
            return new Promise((resolve,reject)=>{
                banner.findOne({_id:bannerId}).then((banner)=>{
                    resolve(banner)
                })
            })
        },
}
