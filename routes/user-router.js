const express = require('express')
const res = require('express/lib/response')
const router = express.Router()
const {userVerifyLogin}=require('../middleware/userVerifyLogin')
const {AuthAjaxVerification}= require('../middleware/AuthAjax')
const {
    home,
    userLogin,
    userSignUp,
    postUserSignUp,
    postLogin,
    postOtp,
    userShop,
    viewCart,
    doAddToCart,
    changeQuantity,
    viewWishList,
    doAddToWishlist,
    doDeleteWishlist,
    userProfileView,
    userAddressView,
    addAdress,
    editAddress,
    deleteAdd,
    checkoutView,
    placeorder,
    orderSuccessPageView,
    orderDetailsPageView,
    verifyPayment,
    logout
}
    =require ('../controllers/user-controller')

router.get('/',home)
router.get('/login',userLogin)
router.post('/login',postLogin)
router.get('/signup',userSignUp)
router.post('/signup',postUserSignUp)
router.post('/gnenerateOtp',postOtp)
router.get('/shop',userShop)
router.get('/viewCart',userVerifyLogin,viewCart)
router.get('/addToCart/:id',doAddToCart)
router.post('/changeQuantity',AuthAjaxVerification, changeQuantity)
router.get('/wishlist', viewWishList)
router.get('/addToWishlist/:id',doAddToWishlist)
router.post('/deleteWishlist',AuthAjaxVerification,doDeleteWishlist)
router.get('/profile',userProfileView)
router.get('/address', userAddressView)
router.post('/address',addAdress)
router.post('/addresses/:id',editAddress)
router.post('/deleteAddress',deleteAdd)
router.get('/checkout',userVerifyLogin,checkoutView)
router.post('/placeOrder',placeorder)
router.get('/orderSuccess',orderSuccessPageView)
router.get('/orders',orderDetailsPageView)
router.post('/verifyPayment',verifyPayment)
router.get('/logout',logout)


module.exports =  router