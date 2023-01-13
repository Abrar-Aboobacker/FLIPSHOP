const express = require('express')
const res = require('express/lib/response')
const router = express.Router()
const store = require('../middleware/multer')
const {adminVerifyLogin}=require('../middleware/adminVerifyLogin')
const {adminLogin,
    adminDashboard,
    adminPostLogin,
    // AdminProductManagment,
    AdminCategoryManagment,
    addCategory,
    postCategory,
    disableCategory,
    unableCategory,
    AdminCouponManagment,
    addCoupon,
    postCoupon,
    unableCoupon,
    disableCoupon,
    editCoupon,
    postEditCoupoun,
    addProduct,
    postProduct,
    AdminProductManagment,
    editProduct,
    postEditProduct,
    // deleteProduct,
    disableProduct,
    unableProduct,
    AdminUserManagment,
    BlockUser,
    unblockUser,
    orderDetailsPageView,
    changeStatus,
    bannerDetailsView,
    addBanner,
    postBanner,
    editBanner,
    postEditBanner,
    disableBanner,
    unableBanner,
    salesReport,
    monthReport,
    yearReport,
    adminLogout
    }
    
    =require ('../controllers/admin-controller')


router.get('/adlogin',adminLogin)
router.post('/adlogin',adminPostLogin)
router.get('/dashboard',adminVerifyLogin,adminDashboard)
router.get('/products',adminVerifyLogin,AdminProductManagment)
router.get('/addProduct',adminVerifyLogin,store.uploadImages, store.resizeImages,addProduct)
router.post('/products',store.uploadImages, store.resizeImages,postProduct)
router.get('/productEdit/:id',adminVerifyLogin,editProduct)
router.post('/productEdit/:id',store.uploadImages,store.resizeImages, postEditProduct)
// router.get('/deleteProduct/:id',store.uploadImages,store.resizeImages,deleteProduct)
router.get('/productDisable/:id',disableProduct)
router.get('/productEnable/:id',unableProduct)
router.get('/categories',adminVerifyLogin,AdminCategoryManagment)
router.get('/addcategory',adminVerifyLogin,addCategory)
router.post('/categories',store.uploadImages,store.resizeImages,postCategory)
router.get('/disable/:id',disableCategory)
router.get('/enable/:id',unableCategory)
router.get('/coupons',adminVerifyLogin,AdminCouponManagment)
router.get('/addcoupon',adminVerifyLogin,addCoupon)
router.post('/coupons',postCoupon)
router.get('/couponDisable/:id',disableCoupon)
router.get('/couponEnable/:id',unableCoupon)
router.get('/couponEdit/:id',editCoupon)
router.post('/couponEdit/:id',postEditCoupoun)
router.get('/users',adminVerifyLogin,AdminUserManagment)
router.get('/block/:id',BlockUser)
router.get('/unblock/:id',unblockUser)
router.get('/order',orderDetailsPageView)
router.get('/changeStatus',changeStatus)
router.get('/banner',bannerDetailsView)
router.get('/addBanner',addBanner)
router.post('/addBanner',store.uploadImages,store.resizeImages,postBanner)
router.get('/bannerEdit/:id',editBanner)
router.post('/bannerEdit/:id',store.uploadImages,store.resizeImages,postEditBanner)
router.get('/bannerDisable/:id',disableBanner)
router.get('/bannerEnable/:id',unableBanner)
router.get('/dayReport',salesReport)
router.get('/monthReport',monthReport)
router.get('/yearReport',yearReport)
router.get('/logout',adminLogout)


module.exports =  router