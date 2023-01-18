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
    forgetPassword,
    PostforgotPassword,
    newPassword,
    postNewPassword,
    productShow,
    getsingleProduct,
    userShop,
    viewCart,
    doAddToCart,
    changeQuantity,
    viewWishList,
    doAddToWishlist,
    doDeleteWishlist,
    userProfileView,
    profileChanges,
    userAddressView,
    addAdress,
    editAddress,
    deleteAdd,
    couponCheck,
    checkoutView,
    addAdressInCheckout,
    placeorder,
    orderSuccessPageView,
    orderDetailsPageView,
    invoice,
    verifyPayment,
    search,
    logout
}
    =require ('../controllers/user-controller')

router.get('/',home)
router.get('/login',userLogin)
router.post('/login',postLogin)
router.get('/signup',userSignUp)
router.post('/signup',postUserSignUp)
router.post('/gnenerateOtp',postOtp)
router.get('/forgetPassword',forgetPassword)
router.post('/forgetPassword',PostforgotPassword)
router.get('/reset',newPassword)
router.post('/reset',postNewPassword)
router.get('/productShow/:id',productShow)
router.get('/shop',userShop)
router.get('/singleView/:id',getsingleProduct)
router.get('/viewCart',userVerifyLogin,viewCart)
router.get('/addToCart/:id',userVerifyLogin,doAddToCart)
router.post('/changeQuantity',AuthAjaxVerification, changeQuantity)
router.get('/wishlist',userVerifyLogin,viewWishList)
router.get('/addToWishlist/:id',userVerifyLogin,doAddToWishlist)
router.post('/deleteWishlist',AuthAjaxVerification,doDeleteWishlist)
router.get('/profile',userVerifyLogin,userProfileView)
router.post('/profile/:id',userVerifyLogin,profileChanges)
router.get('/address',userVerifyLogin,userAddressView)
router.post('/address',userVerifyLogin,addAdress)
router.post('/addresses/:id',userVerifyLogin,editAddress)
router.post('/deleteAddress',userVerifyLogin,deleteAdd)
router.post('/couponCheck',couponCheck)
router.get('/checkout',userVerifyLogin,checkoutView)
router.post('/addressCheck',userVerifyLogin,addAdressInCheckout)
router.post('/placeOrder',userVerifyLogin,placeorder)
router.get('/orderSuccess',userVerifyLogin,orderSuccessPageView)
router.get('/orders',userVerifyLogin,orderDetailsPageView)
router.get('/invoice',userVerifyLogin,invoice)
router.post('/verifyPayment',AuthAjaxVerification,verifyPayment)
router.post('/search', search)
router.get('/logout',logout)


module.exports =  router