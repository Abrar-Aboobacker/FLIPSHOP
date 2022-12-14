const admins =require('../models/admin');
const category1 = require('../models/category');
const coupons =require('../models/coupon')
const adminDatabase = require('./adminDatabase');
const userHelpers = require('./adminDatabase');



module.exports={
    adminLogin :(req, res) => {
        if(req.session.admin){
    
            res.redirect('/admin/dashboard')
          }else{
            res.render('admin/login',{adloginErr:req.session.adminLoginErr})
            req.session.adminLoginErr=false
            console.log();
          
          }
    },
    adminPostLogin:(req,res)=>{
        console.log(req.body);
        userHelpers.adminlogin(req.body).then((response)=>{
            if(response.status){
              req.session.admin=response.admin
              req.session.adloggedIn=true
              res.redirect('/admin/dashboard')
            }else{
              req.session.adminLoginErr="INCORECT"
              res.redirect('/admin/adlogin')
            }
          })
    },
    adminDashboard:(req,res)=>{

        if(req.session.admin){
            let adminn=req.session.admin
            req.session.admin='dashboard'
          
            
            res.render('admin/index',{admin:true,adminn})
          
          }else{
            res.redirect('/admin/adlogin')
          }
    },
    AdminProductManagment:(req,res)=>{
      res.render("admin/products")
    },
    addProduct:(req,res)=>{
      res.render("admin/add-Product")
    },
    AdminCategoryManagment:(req,res)=>{
      adminDatabase.getAllCategory((err,categoryList)=>{
        res.render("admin/category",{categoryList})
      })
     
    },
    addCategory:(req,res)=>{
      res.render("admin/add-category")
    },
    postCategory:async(req,res)=>{

        const categoryInformation=req.body
        const category = new category1({name:categoryInformation.category,description:categoryInformation.description})
        await category.save((err,doc)=>{
          if(err){
            console.log(err);
          }else{
            console.log(doc);
          }
        })
        console.log(categoryInformation);
        res.redirect("/admin/categories")
        
      },
      disableCategory:async (req,res)=>{
        const id=req.params.id
        await category1.findByIdAndUpdate(id,{access:false},{})
        res.redirect('/admin/categories')
      },
      unableCategory: async (req,res)=>{
        const id = req.params.id
        await category1.findByIdAndUpdate(id,{access:true},{})
        res.redirect('/admin/categories')
      },
      AdminCouponManagment:(req,res)=>{
        adminDatabase.getAllCoupon((err,couponList)=>{
          res.render("admin/coupon",{couponList})
        })
      },
      addCoupon:(req,res)=>{
        res.render("admin/add-coupon")
      },
      postCoupon:async(req,res)=>{

        let couponInformation=req.body
        // couponInformation.expirydate=couponInformation.expirydate.
        const coupon = new coupons({name:couponInformation.couponName,amount:couponInformation.amount,minCartAmount:couponInformation.minPurchase
        ,expireDate:couponInformation.expirydate})
         await coupon.save((err,doc)=>{
          if(err){
            console.log(err);
          }else{
            console.log(doc);
          }
        })
        console.log(couponInformation);
        res.redirect("/admin/coupons")
      },
      disableCoupon:async (req,res)=>{
        const id=req.params.id
        await coupons.findByIdAndUpdate(id,{access:false},{})
        res.redirect('/admin/coupons')
      },
      unableCoupon: async (req,res)=>{
        const id = req.params.id
        await coupons.findByIdAndUpdate(id,{access:true},{})
        res.redirect('/admin/coupons')
      },
      editCoupon: async (req,res)=>{

        let coupon =await adminDatabase.getCouponDetails(req.params.id)
        let coup= coupon
        console.log(coup);
        res.render('admin/edit-coupon',{coup})
      },
      postEditCoupoun: async(req,res)=>{
        console.log("eeeeeeeeeeeeeeee"+req.params.id);
        const id = req.params.id
        console.log(req.body);

        const updatedName=req.body.couponName
        const updatedAmount = req.body.amount
        const updatedMinAmount = req.body.minPurchase
        const updatedExpireDate = req.body.expirydate
       
        

        let coup ={name:updatedName,amount:updatedAmount,minCartAmount:updatedMinAmount,expireDate:updatedExpireDate}
        
        console.log(coup);
       await  coupons.updateOne({_id:id},{
          $set:{
              name:coup.name,
              amount:coup.amount,
              minCartAmount:coup.minCartAmount,
              expireDate:coup.expireDate
              
          }
      })
      res.redirect('/admin/coupons')
    }
}