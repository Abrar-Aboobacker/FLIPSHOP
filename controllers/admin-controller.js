const admins =require('../models/admin');
const category1 = require('../models/category');
const coupons =require('../models/coupon');
const products = require('../models/product');
const user = require ('../models/user')
const adminDatabase = require('./adminDatabase');

module.exports={
    adminLogin :(req, res) => {
        if(req.session.admin){
    
            res.redirect('/admin/dashboard')
          }else{
            res.render('admin/login',{adloginErr:req.session.adminLoginErr})
            req.session.adminLoginErr=false

          
          }
    },
    adminPostLogin:(req,res)=>{
        console.log(req.body);
        adminDatabase.adminlogin(req.body).then((response)=>{

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
            // req.session.admin='dashboard'
          
            
            res.render('admin/index',{admin:true,adminn})
          
          }else{
            res.redirect('/admin/adlogin')
          }
    },
    AdminProductManagment:(req,res)=>{
      adminDatabase.getAllProduct((err,productList)=>{
        res.render("admin/products",{productList})
      })
    },
    addProduct:(req,res)=>{
      adminDatabase.getAllCategory((err,categoryList)=>{
      res.render("admin/add-Product",{categoryList})
    })
  },
    postProduct:async(req,res)=>{
      console.log(req.body,'product boduyyyyyyyyyyyyyyyyyyyyyyyyyyy')
      console.log(req.body.images,'hhhhhhhhhhhhhhhhhhhhhhhhhh');
      const productInformation=req.body
      const product1 = new products({
        name:productInformation.name,
        price:productInformation.price,
        stock:productInformation.stock,
        discount:productInformation.discount,
        size:productInformation.size,
        description:productInformation.description,
        category:productInformation.cat,
        image:req.body.images

      })
      
       product1.save((err,doc)=>{
        if(err){
          res.redirect("/admin/addProduct")
        }else{
          console.log(productInformation);
          res.redirect("/admin/products")
          
        }
      })
    
    },
    editProduct: async (req,res)=>{
      adminDatabase.getAllCategory(async (err,categoryList)=>{
        let product =await adminDatabase.getProductDetails(req.params.id)
      console.log(product+"iugytdytryu");
      res.render('admin/edit-product',{product,categoryList})
      })
    },
    postEditProduct: async(req,res)=>{
      console.log("eeeeeeeeeeeeeeee"+req.params.id);
      const id = req.params.id
      console.log(id +"sdfhiudhsiudfhhdf");
      console.log("ddddddddddddddddddddddddddddddddddddddddddddd");
      console.log(req.body);
      let pro=[]
      const updatedProName=req.body.name
      const updatedCategory = req.body.cat
      const updatedPrice = req.body.price
      const updatedStock = req.body.stock
      const updatedDiscount=req.body.discount
      const updatedSize=req.body.size
      const updatedImage=req.body.images

    
      // const updatedDiscription


      let product ={
        name:updatedProName,
        category:updatedCategory,
        price:updatedPrice,
        stock:updatedStock,
        discount:updatedDiscount,
        size:updatedSize,
        image:updatedImage
      } 
      console.log(product);
      // const image=req.body.images
      if(req.body.images==""){
        
        const productz=await  products.updateOne({_id:id},{

          $set:{
              name:product.name,
              category:product.category,
              price:product.price,
              stock:product.stock,
              discount:product.discount,
              size:product.size,
              
          }
          
      })
      console.log(productz+ "pro");
      }
      else{
        const productz=await  products.updateOne({_id:id},{

          $set:{
              name:product.name,
              category:product.category,
              price:product.price,
              stock:product.stock,
              discount:product.discount,
              size:product.size,
              image:product.image
          }
      })
      }
     
    res.redirect('/admin/products')
  },
    deleteProduct:(req,res)=>{
    let userId=req.params.id
    adminDatabase.deleteProductDetails(userId).then((response)=>{
      req.session.user=null
     req.session.loggedIn=false
      res.redirect('/admin/products')
    }) 
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

        let coup =await adminDatabase.getCouponDetails(req.params.id)
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
    },
    AdminUserManagment:(req,res)=>{
      adminDatabase.getAllUsers((err,users)=>{
        res.render("admin/users",{users})
      })
    },

    BlockUser:async (req,res)=>{
      const id=req.params.id
      await user.findByIdAndUpdate(id,{access:false},{})
      res.redirect('/admin/users')
    },
    unblockUser: async (req,res)=>{
      const id = req.params.id
      await user.findByIdAndUpdate(id,{access:true},{})
      res.redirect('/admin/users')
    },
    adminLogout:(req,res)=>{
      req.session.admin=null
      req.session.adloggedIn=false
      res.redirect('/admin/adlogin')
    }
}