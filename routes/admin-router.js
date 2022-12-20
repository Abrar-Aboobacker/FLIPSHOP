const express = require('express')
const res = require('express/lib/response')
const router = express.Router()
const store = require('../middleware/multer')
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
    deleteProduct,
    AdminUserManagment,
    BlockUser,
    unblockUser,
    adminLogout
    }
    
    =require ('../controllers/admin-controller')


router.get('/adlogin',adminLogin)
router.post('/adlogin',adminPostLogin)
router.get('/dashboard',adminDashboard)
router.get('/products',AdminProductManagment)
router.get('/addProduct',store.uploadImages, store.resizeImages,addProduct)
router.post('/products',store.uploadImages, store.resizeImages,postProduct)
router.get('/productEdit/:id',editProduct)
router.post('/productEdit/:id',store.uploadImages,store.resizeImages, postEditProduct)
router.get('/deleteProduct/:id',store.uploadImages,store.resizeImages,deleteProduct)
router.get('/categories',AdminCategoryManagment)
router.get('/addcategory',addCategory)
router.post('/categories',postCategory)
router.get('/disable/:id',disableCategory)
router.get('/enable/:id',unableCategory)
router.get('/coupons',AdminCouponManagment)
router.get('/addcoupon',addCoupon)
router.post('/coupons',postCoupon)
router.get('/couponDisable/:id',disableCoupon)
router.get('/couponEnable/:id',unableCoupon)
router.get('/couponEdit/:id',editCoupon)
router.post('/couponEdit/:id',postEditCoupoun)
router.get('/users',AdminUserManagment)
router.get('/block/:id',BlockUser)
router.get('/unblock/:id',unblockUser)
router.get('/logout',adminLogout)


module.exports =  router