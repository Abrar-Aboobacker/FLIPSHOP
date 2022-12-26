
const UserDatabase= require('./userDatabase')
const users1 =require('../models/user')
const bcrypt = require('bcrypt')
const { sendOtp, verifyOtp } = require('../middleware/otp')
const user = require('../models/user')
const product = require ('../models/product')
const userDatabase = require('./userDatabase')
const adminDatabase = require ('./adminDatabase')
const { response } = require('express')
module.exports={
    home:(req, res, next) =>{
          let users=req.session.user
          console.log(users);
        adminDatabase.getAllProduct((err,productList)=>{
          // console.log(productList);
          res.render('user/index', {users,productList});
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
      // let {name,email,phone,password,confirmPassword}=req.session.signup
      // password = await bcrypt.hash(password, 10)
      // confirmPassword = await bcrypt.hash(confirmPassword, 10)
      // console.log('otp verifying');
      // let members = new user({
      //     name: name,
      //     email: email,
      //     phone:phone,
      //     password: password,
      //     confirmPassword: confirmPassword
      // })
      // console.log(members);
      // members.save()
      // res.redirect('/signup')
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
      adminDatabase.getAllProduct((err,productList)=>{
        res.render("user/shop",{productList,users})
      })
    }, 
    //   doAddToCart:async (req,res)=>{
    //   console.log("isComing");
    //   const  userId =req.session.user._id
    //   const userrs= await user.findById(userId)
    //   const products =req.params.id
    //   console.log(products,'ithaanu');
    //   console.log(userrs+111111111111111);
    //   product.findById(products).then((prducts)=>{
    //     console.log(prducts,'Muthamni');
    //     userrs.addToCart(prducts)
    //     })
    // },
    // viewCart:async(req,res)=>{
    //   // console.log("hy");
    //   let users =req.session.user
    //   // let userId=req.session.user._id

    //   // // let cartpd = pro[0].product
    //   // console.log(pro);
    //   // res.render('user/cart',{users,pro})
    //   console.log("isComing");
    //   const  userId =req.session.user._id
    //   const userrs= await user.findById(userId)
    //   const products =req.params.id
    //   console.log(products,'ithaanu');
    //   console.log(userrs+111111111111111);
    //   let pro = await user.findOne({_id:userId}).populate('cart.items.productId')
    //   product.findById(products).then((prducts)=>{
    //     console.log(prducts,'Muthamni');
    //     userrs.addToCart(prducts,()=>{
    //       res.render('user/cart',{users,pro})
    //     })
    //     })
    // },
    // doAddToCart:(req,res)=>{
    //   const productId =req.params.id
    // },
    viewCart:async (req,res)=>{
      // console.log("ethndo");
      const users=req.session.user
      const userId=req.session.user._id
      const prd = await user.findOne({_id:userId}).populate('cart.items.productId')
      console.log(prd,"dfgdfgdgf");
      res.render('user/cart',{users,prd})
    },
    doAddToCart:async(req,res)=>{
      console.log("ethndo");
      const id =req.session.user._id
      const usser= await user.findById(id)
      console.log(usser);
      const products=req.params.id
      console.log(product);
      product.findById(products).then((prduct)=>{
        usser.addToCart(prduct,()=>{
          res.redirect('/viewCart')
        })
      })
    },
    logout:(req,res)=>{
      req.session.user=null
      req.session.loggedIn=false
      res.redirect('/')
    }
}