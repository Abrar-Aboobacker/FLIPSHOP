
const UserDatabase= require('./userDatabase')
const users1 =require('../models/user')
const bcrypt = require('bcrypt')
const { sendOtp, verifyOtp } = require('../middleware/otp')
const user = require('../models/user')
const product = require ('../models/product')
const userDatabase = require('./userDatabase')
const adminDatabase = require ('./adminDatabase')
const wishlist= require('../models/wishlist')
const { response } = require('express')
module.exports={
    home:(req, res, next) =>{
          let users=req.session.user
          console.log(users);
          let count= null;
          if(users){
            count= users.cart.items.length
          }
          console.log(count);
        adminDatabase.getAllProduct((err,productList)=>{
          
          res.render('user/index', {users,productList,count});
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
    viewCart:async (req,res)=>{
      // console.log("ethndo");
      const users=req.session.user
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      console.log(count);
      const userId=req.session.user._id
      const prd = await user.findOne({_id:userId}).populate('cart.items.productId')
      // console.log(prd,"dfgdfgdgf");
      res.render('user/cart',{users,prd,count})
    },
    doAddToCart:async(req,res)=>{
      // console.log("ethndo");
      const id =req.session.user._id
      const usser= await user.findById(id)
      // console.log(usser);
      const products=req.params.id
      // console.log(product);
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
      const id =req.session.user._id
      const products=req.params.id
      const wish =await wishlist.findOne({userId:id})
      if(wish){
        // console.log('und');
        wish.addToWishlist(products,async(response)=>{
          const proDt = await wishlist.find({userId:id},{productItems:1,_id:0}).populate('productItems')
          if(response.status){
            wishlist.findByIdAndUpdate({userId:id},{$push:{products}})
          }
        })

      }else{
        const newWishlist = new wishlist({
          userId:id,
          productId:products
        })
        newWishlist.save()
      }
      },
    logout:(req,res)=>{
      req.session.user=null
      req.session.loggedIn=false
      res.redirect('/')
    }
  }