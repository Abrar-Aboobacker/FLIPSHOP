const crypto =require('crypto')
const UserDatabase= require('./userdatabase')
const users1 =require('../models/user')
const bcrypt = require('bcrypt')
const { sendOtp, verifyOtp } = require('../middleware/otp')
const user = require('../models/user')
const product = require ('../models/product')
const userDatabase = require('./userdatabase')
const adminDatabase = require ('./admindatabase')
const wishlist= require('../models/wishlist')
const addresses = require('../models/address')
const orders2 = require('../models/orders')
const coupon = require('../models/coupon')
const { response } = require('express')
const category = require('../models/category')
const mongoose =require('mongoose')
const banner = require ('../models/banner')
const nodemailer = require('nodemailer')
const address2 = require('../models/address')
const nodeUser= process.env.nodeMailer_User
const nodePass = process.env.SMTP_key_value
const port =  process.env.SMTP_PORT
const host = process.env.host


const mailer = nodemailer.createTransport({
 
  host:host,
  port:port,
  auth:{
      user:nodeUser,
      pass:nodePass
  }
})
module.exports={
    home:async (req, res, next) =>{
      try{
          let users=req.session.user
          let count= null;
          if(users){
            count= users.cart.items.length
          }
          let emailSent = req.flash('emailSent')
          const categories = await category.find().where()
          const bannerzz = await banner.find().where()
          const productList = await product.find()
          res.render('user/index', {users,productList,count,categories,bannerzz,emailSent});
        }catch(e){
          next(new Error(e))
        }
        },
    userSignUp:(req,res,next)=>{
      try{
        if(req.session.user){
            res.redirect('/')
        }else{
          var emailerr=req.flash('emailExist')
            res.render("user/signup",{emailerr})
        } 
      }catch(e){
        next(new Error(e))
      } 
    } , 
postUserSignUp: async (req, res,next) => {
  try{
  const mobilenum = req.body.phoneno
  req.session.signup = req.body
  const uusser = await user.findOne({ email: req.body.email })
  if (uusser) {
    req.flash('emailExist','This email is already used. Please try with another Email Id')
      res.redirect('/signup')
  } else {
      sendOtp(mobilenum)
      res.render('user/otp.ejs', { uzer: false, num: mobilenum, admin: false, error: false })
  }
  }catch(e){
    next(new Error(e))
  }
},
postOtp: async (req, res,next) => {
  try {
      let {fName, lName, email, phoneno, pass,cpass } = req.session.signup
      const otp = req.body.otpis

      await verifyOtp(phoneno, otp).then(async (verification_check) => {
          if (verification_check.status == "approved") {
              pass = await bcrypt.hash(pass, 10)
              cpass = await bcrypt.hash(cpass, 10)
              let members = new user({
                  fristName:fName,
                  lastName:lName,
                  email:email,
                  phone:phoneno,
                  password:pass,
                  cPassword:cpass,    
              })
              members.save((err, newUser) => {
                  if (err) {
                      res.redirect('/signup')
                  }
                  else {
                    req.session.user=newUser
                    req.session.loggedIn=true
                       res.redirect('/')
                  }
              })
          } else if (verification_check.status == "pending") {
              res.redirect('/signup')
          }
      })


  } catch(e){
    next(new Error(e))
  }
    },
    userLogin:(req,res,next)=>{
      try{
      if(req.session.user){
        res.redirect('/')
      }else{
        var userLoginErr =  req.session.userLoginErr
        req.session.userLoginErr=false
        res.render('user/login',{userLoginErr})
      }
    }catch(e){
      next(new Error(e))
    }
    },
    postLogin:(req,res,next)=>{
      try{
      userDatabase.doLogin(req.body).then((response)=>{
        if(response.status){
          req.session.user=response.user
          req.session.loggedIn=true
          res.redirect('/')
        }else{
          req.session.userLoginErr="Invalid username or password"
          res.redirect('/login')
        }
      })
    }catch(e){
      next(new Error(e))
    }
    },
    forgetPassword:(req,res,next)=>{
      try{
      var error = req.flash('error')
      res.render('user/forget-password',{error})
      }catch(e){
        next(new Error(e))
      }
    },
    PostforgotPassword:async(req,res,next)=>{
      try{
      crypto.randomBytes(32,(err,buffer)=>{
        if(err){
         return  res.redirect('/forgetPassword')
        }
        const token =buffer.toString('hex')
        user.findOne({email:req.body.email}).then(users=>{
          if (!users) {
            req.flash('error',
            'Sorry No such account with this email,Please enter a valid email id')
            return res.redirect('/forgetPassword')
          }
          users.resetToken=token;
          users.resetTokenExpiration=Date.now()+3600000
          users.save()
        })
        .then(result=>{
          req.flash('emailSent',
          'We have send an email to your email Id, It may be in spam messages')
           res.redirect('/')
          var emails = {
            to:req.body.email,
            from:nodeUser,
            subject: 'password reseted',
            html: `
              <p>You Requested  a Password reset </p>
               <p>Click this <a href="http://localhost:3000/reset?token=${token}">link</a> to set a password.</p>
       `
        }
        mailer.sendMail(emails, function(err, res) {
          if (err) { 

          }else{
          }
        })
        })
        .catch(err=>{
        })
      })
    }catch(e){
      next(new Error(e))
    }
    },
    newPassword:(req,res,next)=>{
      try{
      const token = req.query.token;
       user.findOne({resetToken:token,resetTokenExpiration:{$gt:Date.now()}})
       .then(usserz=>{
        res.render('user/new-password',{userid:usserz._id,passwordToken:token})
       })
       .catch(err=>{
       })
      }catch(e){
        next(new Error(e))
      }
    },
    postNewPassword:(req,res,next)=>{
      try{
      let updatedUser;
      const newpassword = req.body.pass;
      const userId = req.body.userid;
      const passwordToken = req.body.passwordToken
      user.findOne({
        resetToken:passwordToken,
        resetTokenExpiration:{$gt:Date.now()},
        _id:userId}).then(users=>{
      updatedUser = users
     return bcrypt.hash(newpassword,12)
    }).then(hashedpassword=>{
      updatedUser.password = hashedpassword
      updatedUser.conform = hashedpassword
      updatedUser.resetToken=undefined
      updatedUser.resetTokenExpiration = undefined
      return updatedUser.save()
    }).then(result=>{
      res.redirect('/login')
    })
  }catch(e){
    next(new Error(e))
  }
    },
    productShow: async (req,res,next)=>{
      try{
      let users=req.session.user
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      const id = req.params.id
      const cat = await category.findById(id)
      const categories = await category.find().where()
      const pro = await product.find({category:cat.name})
      res.render("user/catproduct",{pro,users,count,categories})
    }catch(e){
      next(new Error(e))
    }
    },
    userShop:async (req,res,next)=>{
      try{
      let productList;
      let users=req.session.user
      const page = +req.query.page||1
      const items_per_page = 6;
      const categories = await category.find().where()
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      const totalproducts = await product.find().countDocuments()
      if(req.query.q){
         const Id=req.query.q
         productList = await product.find({_id:Id})
      }else if (req.query.cat) {
        const cat = req.query.cat
        productList = await product.find({_id:cat})
      } else {
        productList= await product.find().skip((page - 1) * items_per_page).limit(items_per_page);
      }
        res.render("user/shop",{productList,users,count,page,curentPage:page,hasNextPage: items_per_page * page < totalproducts,
          hasPreviousPage: page > 1,nextPage:page+1,lastPage:Math.ceil(totalproducts/items_per_page),
          PreviousPage: page - 1,categories})
        }catch(e){
          next(new Error(e))
        }
    }, 
    getsingleProduct :async (req, res,next) => {
      try{
      const users = req.session.user;
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      const id= req.params.id
      const viewproduct = await product.findById(id)
        res.render('user/productdetails',{viewproduct,count,users});
    }catch(e){
      next(new Error(e))
    }
    },
    couponCheck:async (req,res,next)=>{
      try{
      let codes=req.body.code
      let code1 = codes.trim()
      let total = req.body.total
      let total1 =parseInt(total) 
      const coupons = await coupon.findOne({code:code1})
      if(coupons&& coupons.minCartAmount<=total1){
        const amount = coupons.amount
        const carttotal = total1 - amount
        res.json({status:true,total:carttotal})
      }else{
        res.json({status:false,message:'No such coupon'})
      }
    }catch(e){
      next(new Error(e))
    }
    },
    viewCart:async (req,res,next)=>{
      try{
      const users=req.session.user
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      const userId=req.session.user._id
       const couponz= await coupon.find().where() 
      const prd = await user.findOne({_id:userId}).populate('cart.items.productId')
      const cart=prd.cart.totalPrice
      // const cart = await user.findOne({cart:})
      if (cart==null||cart==0){
        res.render('user/cart-empty',{users,count})
      }else{
      res.render('user/cart',{users,prd,count,userId,couponz})}
      }catch(e){
        next(new Error(e))
      }
    },
    doAddToCart:async(req,res,next)=>{
      try{
      const id =req.session.user._id
      const usser= await user.findById(id)
      const products=req.params.id
      product.findById(products).then((prduct)=>{
        usser.addToCart(prduct,()=>{
          res.redirect('/viewCart')
        })
      })
    }catch(e){
      next(new Error(e))
    }
    },
    changeQuantity:async (req,res,next)=>{
      try{
      const id =req.session.user._id
      const productId=req.body.productId
      const usser = await user.findById(id)
      usser.changeQty(productId,req.body.quantys,req.body.count,(response)=>{
        response.access = true
        res.json(response)
      })
    }catch(e){
      next(new Error(e))
    }
    },
    viewWishList:async (req,res,next)=>{
      // try{
      let users=req.session.user
      let id=req.session.user._id.toString()
      var prd = await wishlist.findOne({userId:id}).populate('productItems')
      let count= null;
      if(users){
        count= users.cart.items.length
      }
     console.log(prd.productItems+"hhhh");
      if (prd==null||prd.productItems==""){
        res.render('user/wishlist-empty',{users,count})
      }else{
        res.render('user/wishlist',{users,prd,count})
      }
      
    // }catch(e){
    //   next(new Error(e))
    // }
    },
    doAddToWishlist:async(req,res,next)=>{
      try{
      const usser =req.session.user
      let id =req.session.user._id
      const products=req.params.id
      const wish =await wishlist.findOne({userId:id})
      if(wish){
        wish.addToWishlist(products,async(response)=>{
          const proDt = await wishlist.find({userId:id},{productItems:1,_id:0}).populate('productItems')
          if(response.status){
            res.redirect('/wishlist')
          }else{
            res.redirect('/shop')
          }
          
        })

      }else{
        const newWishlist = new wishlist({
          userId:id,
          productId:products
        })
        newWishlist.save((err,doc)=>{
          if(doc){
            res.redirect('/wishlist')
          }else{
            res.redirect('/shop')
          }
        })
      }
    }catch(e){
      next(new Error(e))
    }
      },
      doDeleteWishlist:(req,res,next)=>{
        try{
        const id = req.session.user._id
        const products= req.body.productId
        const response={}
        wishlist.updateOne({userId:id},{$pull:{productItems:products}}).then(()=>{
          response.access=true
          res.json(response)
        })
      }catch(e){
        next(new Error(e))
      }
      },
      userProfileView:async (req,res,next)=>{
        try{
        let users=req.session.user
        let id = req.session.user._id
        const userz= await  user.findOne({_id:id})
        let count= null;
      if(users){
        count= users.cart.items.length
      }

      res.render('user/userprofile',{users,count,userz})
    }catch(e){
      next(new Error(e))
    }
      },
      profileChanges:async (req,res,next)=>{
        try{
        const id = req.params.id
        const changeInformation = req.body
        const userz = await user.updateOne({_id:id},{
          $set:{
            fristName:changeInformation.fName,
            lastName:changeInformation.lName,
            email:changeInformation.email,
            phone:changeInformation.no
          }
        })
     
        res.redirect("/profile")
      }catch(e){
        next(new Error(e))
      }
      },
      userAddressView:async (req,res,next)=>{
        try{
        const id = req.session.user._id
        let users=req.session.user
        let count= null;
       
      if(users){
        count= users.cart.items.length
      }
      const adds= await addresses.findOne({userId:id})
    if(adds == null){
      // const add=adds.address
      res.render('user/address',{users,count,adds})
    }else{
      const add=adds.address
        res.render('user/address',{users,count,add,adds})
    }
  }catch(e){
    next(new Error(e))
  }
      },
      addAdress:async (req,res,next)=>{
        try{
        const id = req.session.user._id
        const addres = req.body
       
        const add= await addresses.findOne({userId:id})
        if(add){
          addresses.updateOne({userId:id},{$push:{address:addres}}).then(()=>{
            res.redirect("/address")
          })
        }else{
          const newAddress= new addresses({
            userId:id,
            address:[addres]
          })
          newAddress.save((err,doc)=>{
            if(doc){
              res.redirect('/address')
            }else{

            }
            
          })
        }
      }catch(e){
        next(new Error(e))
      }
      },
    editAddress:async (req,res,next)=>{
      try{
      const addId=req.params.id
      const userId= req.session.user._id
      const update={
        name:req.body.name,
        mobile:req.body.mobile,
        pin:req.body.pin,
        locality:req.body.locality,
        addressDetails:req.body.addressDetails,
        district:req.body.district,
        state :req.body.state,
        landmarkrk:req.body.landmark,
        optmob:req.body.optmob
      }
      const addCheck=await addresses.findOne({userId:userId})
      addCheck.editAdd(update,addId).then((doc)=>{
        res.redirect('/address')
      })
    }catch(e){
      next(new Error(e))
    }
    },
    deleteAdd:(req,res,next)=>{
      try{
      const id = req.session.user._id
      const address=req.body.addressId
      const response={}
      addresses.updateOne({userId:id},{$pull:{address:{_id:address}}})
      .then(()=>{
        response.access=true
      }).catch((er)=>{
      }).then(()=>{
        res.json(response)
      })     
    }catch(e){
      next(new Error(e))
    }
    },
    checkoutView:async (req,res,next)=>{
      try{
      let users=req.session.user
      const id = req.query.user
      let couponCode =req.query.code
      let couponCode1=couponCode.trim()
      let total = req.query.total
      if(couponCode1!==""){
        const couponz = await coupon.findOne({code:couponCode1})
        const index = await couponz.userUsed.findIndex(obj=>obj.userId==id)
        if(index>=0){
          req.flash('error','You are already used the coupon')
        }else{
          const userz = {userId:''}
          userz.userId =id
          await coupon.findOneAndUpdate({code:couponCode1},{$addToSet:{userUsed:userz}})
          const userr = await user.findOne({_id:id})
          total=parseInt(total)
          userr.cart.totalPrice=total
        const news =  await userr.save()
        }
      }
      const prd = await user.findOne({_id:id}).populate('cart.items.productId')
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      const adds = await addresses.findOne({userId:id})
      var error=req.flash('error')
      if(adds==null){
        res.render('user/checkout',{users,count,adds,prd,error,total})
      }else{
        const add=adds.address
        res.render('user/checkout',{users,count,adds,add,prd,error,total})
      }
    }catch(e){
      next(new Error(e))
    }
    },
    addAdressInCheckout:async (req,res,next)=>{
      try{
      let users=req.session.user
      const id = req.session.user._id
      let total = req.query.total
      const addres = req.body
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      const adds= await addresses.findOne({userId:id})
      const prd = await user.findOne({_id:id}).populate('cart.items.productId')
      if(adds){
        var error=req.flash('error')
        const add=adds.address
        addresses.updateOne({userId:id},{$push:{address:addres}}).then(()=>{
          res.render("user/checkout",{users,count,add,adds,prd,total,error})
        })
      }else{
        const newAddress= new addresses({
          userId:id,
          address:[addres]
        })
        newAddress.save((err,doc)=>{
          if(doc){
            var error=req.flash('error')
            res.render("user/checkout",{users,count,adds,prd,total,error})
          }else{
          }
          
        })
      }
    }catch(e){
      next(new Error(e))
    }
    },
     placeorder:(req,res,next)=>{ 
      try{   
      var totalPrice = req.body.totalPrice
      var totalPrice=Number(totalPrice)
      UserDatabase.placeOrder(req.body).then((orderId)=>{
       if (req.body.payment=='cod'){
        res.json({codSuccess:true})
        } else{
        userDatabase.generateRazorpay(orderId,totalPrice).then((response)=>{
            res.json(response)
        })
       }
      })
    }catch(e){
      next(new Error(e))
    }
    },
    verifyPayment:(req,res,next)=>{
      try{
      userDatabase.verifyPayment(req.body).then(()=>{
        userDatabase.changePaymentStatus(req.body.order.receipt).then(()=>{
          res.json({status:true})

        })
      }).catch((err)=>{
        res.json({status:false,erMsg:""})
      })
    }catch(e){
      next(new Error(e))
    }
    },
    orderSuccessPageView:(req,res,next)=>{
      try{
      res.render('user/ordersuccesspage')
      }catch(e){
        next(new Error(e))
      }
    },
    orderDetailsPageView:async (req,res,next)=>{
      try{
      let users=req.session.user
      
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      id=req.session.user._id
      const orders = await orders2.find({userid:id}).populate('products.productId')
      res.render('user/ordersview',{orders,count,users})
    }catch(e){
      next(new Error(e))
    }
    },
    invoice: async (req, res,next) => {
      try{
      const orderId = req.query.id
      const orderDetials = await orders2.findOne({ _id: orderId }).populate('products.productId')
      res.render('user/invoice', {  orderDetials, })
      }catch(e){
        next(new Error(e))
      }
    },
  search: async (req, res,next) => {
    try{
    const sResult = [];
    const skey = req.body.payload;
    const regex = new RegExp(`^${skey}.*`, 'i');
    const pros = await product.aggregate([{
      $match: {
        $or: [{ name: regex },
          { description: regex }],
      },
    }]);
    pros.forEach((val) => {
      sResult.push({ name: val.name, type: 'Products', id: val._id });
    });
   
    const catlist = await category.aggregate([{
      $match: {
        $or: [{ name: regex },
          { description: regex }],
      },
    }]);
    catlist.forEach((val) => {
      sResult.push({ title: val.name, type: 'category', id: val._id });
    });

    res.send({ payload: sResult });
  }catch(e){
    next(new Error(e))
  }
  },
  error: (req, res,next) => {
    try{
    res.render('user/error');
    }catch(e){
      next(new Error(e))
    }
  },
    logout:(req,res,next)=>{
      try{
      req.session.user=null
      req.session.loggedIn=false
      res.redirect('/')
      }catch(e){
        next(new Error(e))
      }
    }
    
  }