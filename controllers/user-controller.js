
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
const { response } = require('express')
const mongoose =require('mongoose')
const { compareSync, setRandomFallback } = require('bcryptjs')
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
      userProfileView:(req,res)=>{
        let users=req.session.user
        let count= null;
      if(users){
        count= users.cart.items.length
      }
      res.render('user/userProfile',{users,count})
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
        const addres = req.body
        console.log(req.body);
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
      const id = req.session.user._id
      let users=req.session.user
      const prd = await user.findOne({_id:id}).populate('cart.items.productId')
      let count= null;
      if(users){
        count= users.cart.items.length
      }
      const adds = await addresses.findOne({userId:id})
      if(adds==null){
        res.render('user/checkout',{users,count,adds,prd})
      }else{
        const add=adds.address
        res.render('user/checkout',{users,count,adds,add,prd})
      }
      // res.render('user/checkout',{users,count,adds,prd})
    },
    placeorder:(req,res)=>{
      
      console.log('reaching');
      console.log(req.body);
      UserDatabase.placeOrder(req.body).then((response)=>{

      })
    },
    orderSuccessPageView:(req,res)=>{

    },
    logout:(req,res)=>{
      req.session.user=null
      req.session.loggedIn=false
      res.redirect('/')
    }
  }