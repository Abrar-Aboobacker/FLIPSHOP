const admins =require('../models/admin');
const category1 = require('../models/category');
const coupons =require('../models/coupon');
const products = require('../models/product');
const user = require ('../models/user')
const orders2=require('../models/orders')
const adminDatabase = require('./admindatabase');
const product = require('../models/product');
const banner = require('../models/banner');
const { handleDuplicate } = require('../middleware/dberrors')

module.exports={
  adminLogin :(req, res,next) => {
    try{
    if(req.session.admin){
        res.redirect('/admin/dashboard')
      }else{
        var adminLoginErr =  req.session.adminLoginErr
        req.session.adminLoginErr=false
        res.render('admin/login',{adminLoginErr})
      }
    }catch(e){
      next(new Error(e))
    }
},
    adminPostLogin:(req,res,next)=>{
      try{
        adminDatabase.adminlogin(req.body).then((response)=>{

            if(response.status){
              req.session.admin=response.admin
              req.session.adloggedIn=true
              res.redirect('/admin/dashboard')
            }else{
              
              req.session.adminLoginErr="INCORECT"
              res.redirect('/admin/adlogin') 
            }
          })
        }catch(e){
          next(new Error(e))
        }
    },
    adminDashboard:async (req,res,next)=>{
      try{
        if(req.session.admin){
            let admins=req.session.admin 
            let userCount;
            let categoryCount;
            let proCount = 0;
            let orderCount;
            const query = user.find();
            query.count((err, count) => {
              userCount = count;
          });
            const category = category1.find();
            category.count((err, count) => {
              categoryCount = count;
          });
            const Pro = product.find();
            Pro.count((err, count) => {
            proCount = count;
          });

            const revenue = await orders2.aggregate([
          {
        $match: {
            $or: [{ $and: [{ status: { $eq: 'Delivered' }, payment: { $eq: 'cod' } }] },
            { $and: [{ status: { $eq: 'Delivered' }, payment: { $eq: 'razorPay' } }] },
            { $and: [{ status: { $eq: 'Placed' }, payment: { $eq: 'razorPay' } }] }],
         },
      },

      {
        $group: {
          _id: {
         },
            totalPrice: { $sum: '$total' },
            items: { $sum: { $size: '$products' } },
            count: { $sum: 1 },

        },
          }, { $sort: { createdAt: -1 } },
      ]);
        const date = new Date();
        const day = date.getDate();
        let month = date.getMonth();
        month += 1;
        const year = date.getFullYear();
        const todayrevenue = await orders2.aggregate([
      {
       $match: {
          $or: [{ $and: [{ status: { $eq: 'Delivered' }, payment: { $eq: 'cod' } }] },
        { $and: [{ status: { $eq: 'Delivered' }, payment: { $eq: 'razorPay' } }] },
        { $and: [{ status: { $eq: 'Placed' }, payment: { $eq: 'razorPay' } }] }],
          },
        }, {
          $addFields: { Day: { $dayOfMonth: '$date' }, Month: { $month: '$date' }, Year: { $year: '$date' } },
        },
        { $match: { Day: day, Year: year, Month: month } },

        {
          $group: {

            _id: {
              day: { $dayOfMonth: '$date' },

            },
            totalPrice: { $sum: '$total' },
            items: { $sum: { $size: '$products' } },
            count: { $sum: 1 },

          },
        },
      ]);

      const todaySales = await orders2.aggregate([
        {
          $match: { status: { $ne: 'Cancelled' } },
        }, {
          $addFields: { Day: { $dayOfMonth: '$date' }, Month: { $month: '$date' }, Year: { $year: '$date' } },
        },
        { $match: { Day: day, Year: year, Month: month } },

        {
          $group: {

            _id: {
              day: { $dayOfMonth: '$date' },

            },
            totalPrice: { $sum: '$total' },
            items: { $sum: { $size: '$products' } },
            count: { $sum: 1 },

          },
        },
      ]);
      const allSales = await orders2.aggregate([
        {
          $match: { status: { $ne: 'Cancelled' } },
        },

        {
          $group: {
            _id: {
            },
            totalPrice: { $sum: '$total' },
            items: { $sum: { $size: '$products' } },
            count: { $sum: 1 },

          },
        }, { $sort: { date: -1 } },
      ]);

      const orders = orders2.find();
      orders.count((err, count) => {
        orderCount = count;
        res.render('admin/index', {
          admins,
          userCount,
          categoryCount,
          proCount,
          orderCount,
          revenue,
          allSales,
          todaySales,
          todayrevenue,
        });
      });         
         
          
          }else{
            res.redirect('/admin/adlogin')
          }
        }catch(e){
          next(new Error(e))
        }
    },
    AdminProductManagment:(req,res,next)=>{
     
      adminDatabase.getAllProduct((err,productList)=>{
        category1.findById()
        res.render("admin/products",{productList})
      })
   
    },
    addProduct:(req,res,next)=>{
      try{
      adminDatabase.getAllCategory((err,categoryList)=>{
      res.render("admin/add-Product",{categoryList})
    })
  }catch(e){
    next(new Error(e))
  }
  },
    postProduct:async(req,res,next)=>{
     try{
      const productInformation=req.body
      const product1 = new products({
        name:productInformation.name,
        price:productInformation.price,
        stock:productInformation.stock,
        discount:productInformation.discount,
        size:productInformation.size,
        description:productInformation.description,
        category:productInformation.cat,
        image:req.body.images

      })
      
       product1.save((err,doc)=>{
        if(err){ 
          
          res.redirect("/admin/addProduct")
        }else{
          res.redirect("/admin/products")
          
        }
      })
    }catch(e){
      next(new Error(e))
    }
    },
    editProduct: async (req,res,next)=>{
      try{
      adminDatabase.getAllCategory(async (err,categoryList)=>{
        let product =await adminDatabase.getProductDetails(req.params.id)
      res.render('admin/edit-product',{product,categoryList})
      })
    }catch(e){
      next(new Error(e))
    }
    },
    postEditProduct: async(req,res,next)=>{
      try{
      const id = req.params.id
      let pro=[]
      const updatedProName=req.body.name
      const updatedCategory = req.body.cat
      const updatedPrice = req.body.price
      const updatedStock = req.body.stock
      const updatedDiscount=req.body.discount
      const updatedSize=req.body.size
      const updatedImage=req.body.images
      
      let product ={
        name:updatedProName,
        category:updatedCategory,
        price:updatedPrice,
        stock:updatedStock,
        discount:updatedDiscount,
        size:updatedSize,
        image:updatedImage
      } 
      if(req.body.images==""){
        
        const productz=await  products.updateOne({_id:id},{

          $set:{
              name:product.name,
              category:product.category,
              price:product.price,
              stock:product.stock,
              discount:product.discount,
              size:product.size,
              
          }
          
      })
     
      }
      else{
        const productz=await  products.updateOne({_id:id},{

          $set:{
              name:product.name,
              category:product.category,
              price:product.price,
              stock:product.stock,
              discount:product.discount,
              size:product.size,
              image:product.image
          }
      })
      }
     
    res.redirect('/admin/products')
      }catch(e){
        next(new Error(e))
      }
  },
  disableProduct:async (req,res,next)=>{
    try{
    const id=req.params.id
    await product.findByIdAndUpdate(id,{access:false},{})
    res.redirect('/admin/products')
    }catch(e){
      next(new Error(e))
    }
  },
  unableProduct: async (req,res,next)=>{
    try{
    const id = req.params.id
    await product.findByIdAndUpdate(id,{access:true},{})
    res.redirect('/admin/products')
    }catch(e){
      next(new Error(e))
    }
  },
    AdminCategoryManagment:(req,res,next)=>{
      try{
      adminDatabase.getAllCategory((err,categoryList)=>{
        res.render("admin/category",{categoryList})
      })
    }catch(e){
      next(new Error(e))
    }
    },
    addCategory:(req,res,next)=>{
      try{
      const errors = req.flash('error')
      res.render("admin/add-category",{errors})
      }catch(e){
        next(new Error(e))
      }
    },
    postCategory:async(req,res,next)=>{
       try{
        const categoryInformation=req.body
        const category = new category1({
          name:categoryInformation.category,
          description:categoryInformation.description,
          image:req.body.images
        })
          category.save((err,doc)=>{
          if(err){
            const error = { ...err }
          let errors
          if (error.code === 11000) {
            errors = handleDuplicate(error)
            res.render('admin/add-category', { errors })
          }
          }else{
            res.redirect("/admin/categories")
          }
        })
      }catch(e){
        next(new Error(e))
      }
      },
      disableCategory:async (req,res,next)=>{
        try{
        const id=req.params.id
        await category1.findByIdAndUpdate(id,{access:false},{})
        res.redirect('/admin/categories')
        }catch(e){
          next(new Error(e))
        }
      },
      unableCategory: async (req,res,next)=>{
        try{
        const id = req.params.id
        await category1.findByIdAndUpdate(id,{access:true},{})
        res.redirect('/admin/categories')
        }catch(e){
          next(new Error(e))
        }
      },
      AdminCouponManagment:(req,res,next)=>{
        try{
        adminDatabase.getAllCoupon((err,couponList)=>{
          res.render("admin/coupon",{couponList})
        })
      }catch(e){
        next(new Error(e))
      }
      },
      addCoupon:(req,res,next)=>{
        try{
        res.render("admin/add-coupon")
        }catch(e){
          next(new Error(e))
        }
      },
      postCoupon:(req,res,next)=>{
        try{
        let couponInformation=req.body
        const coupon = new coupons({code:couponInformation.couponName,amount:couponInformation.amount,minCartAmount:couponInformation.minPurchase
        ,expireDate:couponInformation.expirydate})
         coupon.save((err, doc) => {
          if (err) {
            res.redirect("/admin/addcoupon")
          } else {
            res.redirect("/admin/coupons")
          }
        })
        
      }catch(e){
        next(new Error(e))
      }
      },
      disableCoupon:async (req,res,next)=>{
        try{
        const id=req.params.id
        await coupons.findByIdAndUpdate(id,{access:false},{})
        res.redirect('/admin/coupons')
        }catch(e){
          next(new Error(e))
        }
      },
      unableCoupon: async (req,res,next)=>{
        try{
        const id = req.params.id
        await coupons.findByIdAndUpdate(id,{access:true},{})
        res.redirect('/admin/coupons')
        }catch(e){
          next(new Error(e))
        }
      },
      editCoupon: async (req,res,next)=>{
        try{
        let coup =await adminDatabase.getCouponDetails(req.params.id)
        res.render('admin/edit-coupon',{coup})
        }catch(e){
          next(new Error(e))
        }
      },
      postEditCoupoun: async(req,res)=>{
        try{
        const id = req.params.id
        const updatedName=req.body.couponName
        const updatedAmount = req.body.amount
        const updatedMinAmount = req.body.minPurchase
        const updatedExpireDate = req.body.expirydate
        let coup ={name:updatedName,amount:updatedAmount,minCartAmount:updatedMinAmount,expireDate:updatedExpireDate} 
       await  coupons.updateOne({_id:id},{
          $set:{
              name:coup.name,
              amount:coup.amount,
              minCartAmount:coup.minCartAmount,
              expireDate:coup.expireDate
              
          }
      })
      res.redirect('/admin/coupons')
    }catch(e){
      next(new Error(e))
    }
    },
    AdminUserManagment:(req,res,next)=>{
      try{
      adminDatabase.getAllUsers((err,users)=>{
        res.render("admin/users",{users})
      })
    }catch(e){
      next(new Error(e))
    }
    },

    BlockUser:async (req,res,next)=>{
      try{
      const id=req.params.id
      await user.findByIdAndUpdate(id,{access:false},{})
      res.redirect('/admin/users')
      }catch(e){
        next(new Error(e))
      }
    },
    unblockUser: async (req,res,next)=>{
      try{
      const id = req.params.id
      await user.findByIdAndUpdate(id,{access:true},{})
      res.redirect('/admin/users')
      }catch(e){
        next(new Error(e))
      }
    },
    orderDetailsPageView:async (req,res,next)=>{
      try{
      adminDatabase.getAllOrders((err,orders)=>{
        res.render("admin/order",{orders})
      })
    }catch(e){
      next(new Error(e))
    }
    },
    changeStatus:(req,res,next)=>{
      try{
      const status = req.query.s
      const orederId = req.query.id
      const response = {}
      if(status == "Delivered" || status == 'Cancelled'){
        orders2.findOneAndUpdate({_id:orederId},{$set:{status:status}}).then(()=>{
          response.status = false;
          response.value = status
          res.json(response)
        })
      }else{
      orders2.findOneAndUpdate({_id:orederId},{$set:{status:status}}).then(()=>{
        response.status = true
        res.json(response)
      })
    }
  }catch(e){
    next(new Error(e))
  }
    },
    bannerDetailsView:async (req,res,next)=>{
      try{
      const banners= await banner.find()
      res.render("admin/banner",{banners})
      }catch(e){
        next(new Error(e))
      }
    },
    addBanner:(req,res,next)=>{   
      try{ 
      adminDatabase.getAllCategory((err,categoryList)=>{
        res.render("admin/add-banner",{categoryList})
      })
    }catch(e){
      next(new Error(e))
    }
    },
    postBanner:(req,res,next)=>{
      try{
      const bannerInformation=req.body
      const banners = new banner({
        title:bannerInformation.cat,
        mainTitle:bannerInformation.names,
        description:bannerInformation.description,
        url:bannerInformation.url,
        image:req.body.images
      })
      
       banners.save((err,doc)=>{
        if(err){ 
          res.redirect("/admin/addBanner")
        }else{
          res.redirect("/admin/banner")      
        }
      })
      }catch(e){
        next(new Error(e))
      }
    },
    editBanner: async (req,res,next)=>{
      try{
      adminDatabase.getAllCategory(async (err,categoryList)=>{
        let banner =await adminDatabase.getBannerDetails(req.params.id)
      res.render('admin/edit-banner',{banner,categoryList})
      })
    }catch(e){
      next(new Error(e))
    }
    },
    postEditBanner: async(req,res,next)=>{
      try{
      const id = req.params.id
      const bannerInformation=req.body
      if(req.body.images==""){
        
        const bannerz=await  banner.updateOne({_id:id},{

          $set:{
            title:bannerInformation.cat,
            mainTitle:bannerInformation.names,
            description:bannerInformation.description,
            url:bannerInformation.url,       
          }
          
      })
     
      }
      else{
        const bannerz=await  banner.updateOne({_id:id},{

          $set:{
            title:bannerInformation.cat,
            mainTitle:bannerInformation.names,
            description:bannerInformation.description,
            url:bannerInformation.url,       
            image:req.body.images
          }
      })
      }
     
    res.redirect('/admin/banner')
      }catch(e){
        next(new Error(e))
      }
  },
  disableBanner:async (req,res,next)=>{
    try{
    const id=req.params.id
    await banner.findByIdAndUpdate(id,{access:false},{})
    res.redirect('/admin/banner')
    }catch(e){
      next(new Error(e))
    }
  },
  unableBanner: async (req,res,next)=>{
    try{
    const id = req.params.id
    await banner.findByIdAndUpdate(id,{access:true},{})
    res.redirect('/admin/banner')
    }catch(e){
      next(new Error(e))
    }
  },
  salesReport:async (req,res,next)=>{
    try{
    const sales =await orders2.aggregate([
      {$match:{status:{$eq:'Delivered'}}},
      {
        $group:{
          _id:{
            year:{$year:'$date'},
            month:{$month:'$date'},
            day:{$dayOfMonth:'$date'},
          },
          totalPrice:{$sum:'$total'},
          items:{$sum:{$size:'$products'}},
          count:{$sum:1},
        },
      },{
        $sort:{
          '_id.year':-1,
          '_id.month':-1,
          '_id.day':-1,
        },
      },
    ]);
    res.render('admin/day-report',{sales});
  }catch(e){
    next(new Error(e))
  }
  },
  monthReport:async (req,res,next)=>{
    try{
    const months = [
      'January', 'February', 'March', 
      'April', 'May', 'June',
      'July', 'August', 'September',
      'October', 'November', 'December'
    ];
    const sale= await orders2.aggregate([
      {$match:{status:{$eq:'Delivered'}}},
      {
        $group:{
          _id:{
            month:{$month:'$date'},
          },
          totalPrice:{$sum:'$total'},
          items:{$sum:{$size:'$products'}},
          count:{$sum:1},
        }
      },
      {$sort:{date:1}}
    ]);
    const sales =sale.map((el)=>{
      const newOne ={...el}
      newOne._id.month=months[newOne._id.month-1]
      return newOne
    })
    res.render('admin/month-report',{sales})
  }catch(e){
    next(new Error(e))
  }
  },
  yearReport:async (req,res,next)=>{
    try{
    const sales=await orders2.aggregate([
      {$match:{status:{$eq:'Delivered'}}},
      {
        $group:{
          _id:{
            year:{$year:'$date'},
          },
          totalPrice:{$sum:'$total'},
          items:{$sum:{$size:'$products'}},
          count:{$sum:1},
        }
      },
      {
        $sort:{'_id.year':-1}
      }
    ])
    res.render('admin/year-report',{sales})
  }catch(e){
    next(new Error(e))
  }
  },
  chart1: async (req, res,next) => {
    try{
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const sale = await orders2.aggregate([
        { $match: { status: { $eq: 'Delivered' } } },
        {
          $group: {
            _id: {
              month: { $month: '$date' },
            },
            totalPrice: { $sum: '$total' },
            items: { $sum: { $size: '$products' } },
            count: { $sum: 1 },

          },
        }, { $sort: { '_id.month': -1 } }]);
      const salesRep = sale.map((el) => {
        const newOne = { ...el };
        newOne._id.month = months[newOne._id.month - 1]; 
          return newOne;
         
      });

      res.json({ salesRep });
    }catch(e){
      next(new Error(e))
    }
  },

  chart2: async (req, res,next) => {
    try{
      const payment = await orders2.aggregate([
        { $match: { status: { $eq: 'Delivered' } } },
        {
          $group: {
            _id: {

              payment: '$payment',

            },
            count: { $sum: 1 },

          },
        }, { $sort: { '_id.month': -1 } }]);
      res.json({ payment });
    }catch(e){
      next(new Error(e))
    }
  },
    adminLogout:(req,res)=>{
      try{
      req.session.admin=null
      req.session.adloggedIn=false
      res.redirect('/admin/adlogin')
      }catch(e){
        next(new Error(e))
      }
    }
}