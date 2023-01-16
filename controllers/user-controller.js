const crypto =require('crypto')
const UserDatabase= require('./userDatabase')
const users1 =require('../models/user')
const bcrypt = require('bcrypt')
const { sendOtp, verifyOtp } = require('../middleware/otp')
const user = require('../models/user')
const product = require ('../models/product')
const userDatabase = require('./userDatabase')
const adminDatabase = require ('./adminDatabase')
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
          let users=req.session.user
          let count= null;
          if(users){
            count= users.cart.items.length
          }
          const categories = await category.find().where()
          const bannerzz = await banner.find().where()
          // console.log(categories+"undeeeeeeeee");
        adminDatabase.getAllProduct((err,productList)=>{ 
          res.render('user/index', {users,productList,count,categories,bannerzz});
        })   
        },
    userSignUp:(req,res)=>{
        if(req.session.user){
            res.redirect('/')
        }else{
            res.render("user/signup")
        }  
    } ,
   
postUserSignUp: async (req, res) => {

  const mobilenum = req.body.phoneno
  req.session.signup = req.body
  console.log(req.body)

  const uusser = await user.findOne({ email: req.body.email })

  if (uusser) {
      res.redirect('/login')
  } else {
      sendOtp(mobilenum)
      res.render('user/otp.ejs', { uzer: false, num: mobilenum, admin: false, error: false })
  }

},
postOtp: async (req, res) => {
  try {
      console.log(req.session.signup);
      let {fName, lName, email, phoneno, pass,cpass } = req.session.signup
      const otp = req.body.otpis

      await verifyOtp(phoneno, otp).then(async (verification_check) => {
          console.log(verification_check.status + 'hiiii');
          if (verification_check.status == "approved") {
              console.log(' hhhhhhhhhh');
              pass = await bcrypt.hash(pass, 10)
              cpass = await bcrypt.hash(cpass, 10)
              // console.log('otp verifying');
              let members = new user({
                  fristName:fName,
                  lastName:lName,
                  email:email,
                  phone:phoneno,
                  password:pass,
                  cPassword:cpass,
                 
              })
              console.log(members);
              members.save((err, newUser) => {
                  if (err) {
                      console.log(err.message)
                      res.redirect('/signup')
                  }
                  else {
                      req.session.loggedIn = newUser;
                      res.redirect('/')
                  }
              })
          } else if (verification_check.status == "pending") {
              res.redirect('/signup')
              // console.log('otp not match')
          }
      })


  } catch (e) {
      res.redirect('/signup')
      console.log(e.message);
        }
    },
    userLogin:(req,res)=>{
      if(req.session.user){
        res.redirect('/')
      }else{
        res.render('user/login')
      }
    },
    postLogin:(req,res)=>{
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
    },
    forgetPassword:(req,res)=>{
      res.render('user/forget-password')
    },
    PostforgotPassword:async(req,res)=>{
      crypto.randomBytes(32,(err,buffer)=>{
        if(err){
          console.log(err+"err");
         return  res.redirect('/forgetPassword')
        }
        const token =buffer.toString('hex')
        user.findOne({email:req.body.email}).then(users=>{
          console.log(users+"users");
          if (!users) {
            req.flash('error',
            'sorry No such account with this email,Please enter a valid email id')
            return res.redirect('/forgetPassword')
          }
          users.resetToken=token;
          users.resetTokenExpiration=Date.now()+3600000
          users.save()
        })
        .then(result=>{
          console.log(result);
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
              console.log(err) 
          }else{
            console.log(res.response
              +'email sended');
          }
        })
        })
        .catch(err=>{
          console.log(err);
        })
      })
    },
    newPassword:(req,res)=>{
      const token = req.query.token;
       user.findOne({resetToken:token,resetTokenExpiration:{$gt:Date.now()}})
       .then(usserz=>{
        res.render('user/new-password',{userid:usserz._id,passwordToken:token})
       })
       .catch(err=>{
        console.log(err);
       })
    },
    postNewPassword:(req,res)=>{
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
    },
    productShow: async (req,res)=>{
      let users=req.session.user
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      const id = req.params.id
      const cat = await category.findById(id)
      const pro = await product.find({category:cat.name})
      console.log(pro);
      res.render("user/catProduct",{pro,users,count})
    },
    userShop:(req,res)=>{
      let users=req.session.user
      
      console.log(users);
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      console.log(count);
      adminDatabase.getAllProduct((err,productList)=>{
        res.render("user/shop",{productList,users,count})
      })
    }, 
    couponCheck:async (req,res)=>{
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
    },
    viewCart:async (req,res)=>{
      // console.log("ethndo");
      const users=req.session.user
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      
      const userId=req.session.user._id
       const couponz= await coupon.find().where() 
       console.log(couponz);
      const prd = await user.findOne({_id:userId}).populate('cart.items.productId')
      const cart=prd.cart.totalPrice
      console.log(cart,4444444444);
      // const cart = await user.findOne({cart:})
      if (cart==null||cart==0){
      console.log('hjgfhds');
        res.render('user/cart-empty',{users,count})
      }else{
      res.render('user/cart',{users,prd,count,userId,couponz})}
    },
    doAddToCart:async(req,res)=>{
      const id =req.session.user._id
      const usser= await user.findById(id)
      const products=req.params.id
      product.findById(products).then((prduct)=>{
        usser.addToCart(prduct,()=>{
          res.redirect('/viewCart')
        })
      })
    },
    changeQuantity:async (req,res)=>{
      console.log(req.body);
      const id =req.session.user._id
      const productId=req.body.productId
      const usser = await user.findById(id)
      usser.changeQty(productId,req.body.quantys,req.body.count,(response)=>{
        response.access = true
        res.json(response)
      })
    },
    viewWishList:async (req,res)=>{
      let users=req.session.user
      let id=req.session.user._id.toString()
      // console.log(id);
      const prd = await wishlist.findOne({userId:id}).populate('productItems')
      

      let count= null;
      if(users){
        count= users.cart.items.length
      }
      res.render('user/wishlist',{users,prd,count})
    },
    doAddToWishlist:async(req,res)=>{
      const usser =req.session.user
      let id =req.session.user._id
      const products=req.params.id
      const wish =await wishlist.findOne({userId:id})
      if(wish){
        // console.log('und');
        wish.addToWishlist(products,async(response)=>{
          const proDt = await wishlist.find({userId:id},{productItems:1,_id:0}).populate('productItems')
          if(response.status){
            console.log('entered ');
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
      },
      doDeleteWishlist:(req,res)=>{
        const id = req.session.user._id
  
        const products= req.body.productId
        // console.log(products,55454545445)
        const response={}
        wishlist.updateOne({userId:id},{$pull:{productItems:products}}).then(()=>{
          response.access=true
          res.json(response)
        })

      },
      userProfileView:async (req,res)=>{
        let users=req.session.user
        let id = req.session.user._id
        console.log(id,"iddddddddddd");
        const userz= await  user.findOne({_id:id})
        console.log(userz,'ffffffffffff');
        let count= null;
      if(users){
        count= users.cart.items.length
      }

      res.render('user/userProfile',{users,count,userz})
      },
      profileChanges:async (req,res)=>{
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
      },
      userAddressView:async (req,res)=>{
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
      },
      addAdress:async (req,res)=>{
        const id = req.session.user._id
        console.log(req.body+"bodyyyyyyyyyyyyyyyyyyy");
        const addres = req.body
       
        const add= await addresses.findOne({userId:id})
        if(add){
          console.log("coming home");
          addresses.updateOne({userId:id},{$push:{address:addres}}).then(()=>{
            console.log('ithiludeeeeee');
            res.redirect("/address")
          })
        }else{
          console.log('ivdeeeeeeeeeeeeee');
          const newAddress= new addresses({
            userId:id,
            address:[addres]
          })
          newAddress.save((err,doc)=>{
            if(doc){
              res.redirect('/address')
            }else{
              console.log(err);
            }
            
          })
        }
      },
    editAddress:async (req,res)=>{
      console.log(req.body.name+"bodyyyyyyyyyyyyyyyyyyyyyy")
      const addId=req.params.id
      // console.log(addId + "idddddddddddddddd");
      const userId= req.session.user._id
      console.log(userId+ "useeeeeeeeeeeee");
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
     console.log(update.name);
     console.log(update.mobile);
     console.log(typeof update+'5555555555555555');

      const addCheck=await addresses.findOne({userId:userId})
      addCheck.editAdd(update,addId).then((doc)=>{
        console.log(doc);
        res.redirect('/address')
      })
    },
    deleteAdd:(req,res)=>{
      const id = req.session.user._id
      console.log(id + "id annnn");
      const address=req.body.addressId
      console.log(address +"address annnnnn");
      const response={}
      addresses.updateOne({userId:id},{$pull:{address:{_id:address}}})
      .then(()=>{
        response.access=true
      }).catch((er)=>{
        console.log(er);
      }).then(()=>{
        res.json(response)
      })     
    },
    checkoutView:async (req,res)=>{
      // const id = req.session.user._id
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
      const error=req.flash('error')
      if(adds==null){
        res.render('user/checkout',{users,count,adds,prd,error,total})
      }else{
        const add=adds.address
        res.render('user/checkout',{users,count,adds,add,prd,error,total})
      }
    },
    addAdressInCheckout:async (req,res)=>{
      let users=req.session.user
      const id = req.session.user._id
      let total = req.query.total
      console.log(req.body+"bodyyyyyyyyyyyyyyyyyyy");
      const addres = req.body
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      const adds= await addresses.findOne({userId:id})
      const prd = await user.findOne({_id:id}).populate('cart.items.productId')
      if(adds){
        const add=adds.address
        console.log("coming home");
        addresses.updateOne({userId:id},{$push:{address:addres}}).then(()=>{
          console.log('ithiludeeeeee');
          res.render("user/checkout",{users,count,add,adds,prd,total})
        })
      }else{
        console.log('ivdeeeeeeeeeeeeee');
        const newAddress= new addresses({
          userId:id,
          address:[addres]
        })
        newAddress.save((err,doc)=>{
          if(doc){
            res.render("user/checkout",{users,count,adds,prd,total})
          }else{
            console.log(err);
          }
          
        })
      }
    },
     placeorder:(req,res)=>{    
      console.log(req.body+"hmmmmmmm"); 
      
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
    },
    verifyPayment:(req,res)=>{
      console.log(req.body+"houiiiiiiiiiii");
      userDatabase.verifyPayment(req.body).then(()=>{
        userDatabase.changePaymentStatus(req.body.order.receipt).then(()=>{
          res.json({status:true})

        })
      }).catch((err)=>{
        console.log(err);
        res.json({status:false,erMsg:""})
      })
    },
    orderSuccessPageView:(req,res)=>{
      res.render('user/orderSuccessPage')
    },
    orderDetailsPageView:async (req,res)=>{
      let users=req.session.user
      
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      id=req.session.user._id
      const orders = await orders2.find({userid:id}).populate('products.productId')
      res.render('user/ordersView',{orders,count,users})
    },
    invoice: async (req, res) => {
      const orderId = req.query.id
      const orderDetials = await orders2.findOne({ _id: orderId }).populate('products.productId')
      res.render('user/invoice', {  orderDetials, })
    },
    logout:(req,res)=>{
      req.session.user=null
      req.session.loggedIn=false
      res.redirect('/')
    }
  }