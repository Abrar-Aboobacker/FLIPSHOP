const express = require('express')
const res = require('express/lib/response')
const router = express.Router()
const store = require('../middleware/multer')
const {adminverifylogin}=require('../middleware/adminverifylogin')
const {adminLogin,
    adminDashboard,
    adminPostLogin,
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
    chart1,
    chart2,
    adminLogout
    }
    
    =require ('../controllers/admin-controller')


router.get('/adlogin',adminLogin)
router.post('/adlogin',adminPostLogin)
router.get('/dashboard',adminverifylogin,adminDashboard)
router.get('/products',adminverifylogin,AdminProductManagment)
router.get('/addProduct',adminverifylogin,store.uploadImages, store.resizeImages,addProduct)
router.post('/products',adminverifylogin,store.uploadImages, store.resizeImages,postProduct)
router.get('/productEdit/:id',adminverifylogin,editProduct)
router.post('/productEdit/:id',adminverifylogin,store.uploadImages,store.resizeImages, postEditProduct)
router.get('/productDisable/:id',disableProduct)
router.get('/productEnable/:id',unableProduct)
router.get('/categories',adminverifylogin,AdminCategoryManagment)
router.get('/addcategory',adminverifylogin,addCategory)
router.post('/categories',adminverifylogin,store.uploadImages,store.resizeImages,postCategory)
router.get('/disable/:id',disableCategory)
router.get('/enable/:id',unableCategory)
router.get('/coupons',adminverifylogin,AdminCouponManagment)
router.get('/addcoupon',adminverifylogin,addCoupon)
router.post('/coupons',adminverifylogin,postCoupon)
router.get('/couponDisable/:id',disableCoupon)
router.get('/couponEnable/:id',unableCoupon)
router.get('/couponEdit/:id',adminverifylogin,editCoupon)
router.post('/couponEdit/:id',postEditCoupoun)
router.get('/users',adminverifylogin,AdminUserManagment)
router.get('/block/:id',BlockUser)
router.get('/unblock/:id',unblockUser)
router.get('/order',adminverifylogin,orderDetailsPageView)
router.get('/changeStatus',changeStatus)
router.get('/banner',adminverifylogin,bannerDetailsView)
router.get('/addBanner',adminverifylogin,addBanner)
router.post('/addBanner',store.uploadImages,store.resizeImages,postBanner)
router.get('/bannerEdit/:id',adminverifylogin,editBanner)
router.post('/bannerEdit/:id',store.uploadImages,store.resizeImages,postEditBanner)
router.get('/bannerDisable/:id',disableBanner)
router.get('/bannerEnable/:id',unableBanner)
router.get('/dayReport',adminverifylogin,salesReport)
router.get('/monthReport',adminverifylogin,monthReport)
router.get('/yearReport',adminverifylogin,yearReport)
router.get('/chart1',chart1)
router.get('/chart2',chart2)
router.get('/logout',adminLogout)


module.exports =  router