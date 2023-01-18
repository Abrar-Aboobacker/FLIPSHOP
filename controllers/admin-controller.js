const admins =require('../models/admin');
const category1 = require('../models/category');
const coupons =require('../models/coupon');
const products = require('../models/product');
const user = require ('../models/user')
const orders2=require('../models/orders')
const adminDatabase = require('./adminDatabase');
const product = require('../models/product');
const banner = require('../models/banner');
const { handleDuplicate } = require('../middleware/dberrors')

module.exports={
  adminLogin :(req, res) => {
    if(req.session.admin){
        res.redirect('/admin/dashboard')
      }else{
        var adminLoginErr =  req.session.adminLoginErr
        req.session.adminLoginErr=false
        res.render('admin/login',{adminLoginErr})
      }
},
    adminPostLogin:(req,res)=>{
        console.log(req.body);
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
    },
    adminDashboard:async (req,res)=>{
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
    },
    AdminProductManagment:(req,res)=>{
      adminDatabase.getAllProduct((err,productList)=>{
        category1.findById()
        res.render("admin/products",{productList})
      })
    },
    addProduct:(req,res)=>{
      adminDatabase.getAllCategory((err,categoryList)=>{
      res.render("admin/add-Product",{categoryList})
    })
  },
    postProduct:async(req,res)=>{
     
      const productInformation=req.body
      console.log(productInformation);
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
    
    },
    editProduct: async (req,res)=>{
      adminDatabase.getAllCategory(async (err,categoryList)=>{
        let product =await adminDatabase.getProductDetails(req.params.id)
      console.log(product+"iugytdytryu");
      res.render('admin/edit-product',{product,categoryList})
      })
    },
    postEditProduct: async(req,res)=>{
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
      console.log(product);
      // const image=req.body.images
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
  },
  //   deleteProduct:(req,res)=>{
  //   let userId=req.params.id
  //   adminDatabase.deleteProductDetails(userId).then((response)=>{
  //     req.session.user=null
  //    req.session.loggedIn=false
  //     res.redirect('/admin/products')
  //   }) 
  // },
  disableProduct:async (req,res)=>{
    const id=req.params.id
    await product.findByIdAndUpdate(id,{access:false},{})
    res.redirect('/admin/products')
  },
  unableProduct: async (req,res)=>{
    const id = req.params.id
    await product.findByIdAndUpdate(id,{access:true},{})
    res.redirect('/admin/products')
  },
    AdminCategoryManagment:(req,res)=>{
      adminDatabase.getAllCategory((err,categoryList)=>{
        res.render("admin/category",{categoryList})
      })
     
    },
    addCategory:(req,res)=>{
      const errors = req.flash('error')
      res.render("admin/add-category",{errors})
    },
    postCategory:async(req,res)=>{
       
        const categoryInformation=req.body
        console.log(req.body.images);
        const category = new category1({
          name:categoryInformation.category,
          description:categoryInformation.description,
          image:req.body.images
        })
          category.save((err,doc)=>{
          if(err){
            const error = { ...err }
          console.log(error.code)
          let errors
          if (error.code === 11000) {
            errors = handleDuplicate(error)
            res.render('admin/add-category', { errors })
          }
          }else{
            res.redirect("/admin/categories")
          }
        })
        
        // res.redirect("/admin/categories")
        
      },
      disableCategory:async (req,res)=>{
        const id=req.params.id
        await category1.findByIdAndUpdate(id,{access:false},{})
        res.redirect('/admin/categories')
      },
      unableCategory: async (req,res)=>{
        const id = req.params.id
        await category1.findByIdAndUpdate(id,{access:true},{})
        res.redirect('/admin/categories')
      },
      AdminCouponManagment:(req,res)=>{
        adminDatabase.getAllCoupon((err,couponList)=>{
          res.render("admin/coupon",{couponList})
        })
      },
      addCoupon:(req,res)=>{
        res.render("admin/add-coupon")
      },
      postCoupon:(req,res)=>{

        let couponInformation=req.body
        // couponInformation.expirydate=couponInformation.expirydate.
        const coupon = new coupons({code:couponInformation.couponName,amount:couponInformation.amount,minCartAmount:couponInformation.minPurchase
        ,expireDate:couponInformation.expirydate})
         coupon.save((err, doc) => {
          if (err) {
            console.log(err);
          } else {
            console.log(doc);
          }
        })
        console.log(couponInformation);
        res.redirect("/admin/coupons")
      },
      disableCoupon:async (req,res)=>{
        const id=req.params.id
        await coupons.findByIdAndUpdate(id,{access:false},{})
        res.redirect('/admin/coupons')
      },
      unableCoupon: async (req,res)=>{
        const id = req.params.id
        await coupons.findByIdAndUpdate(id,{access:true},{})
        res.redirect('/admin/coupons')
      },
      editCoupon: async (req,res)=>{

        let coup =await adminDatabase.getCouponDetails(req.params.id)
        console.log(coup);
        res.render('admin/edit-coupon',{coup})
      },
      postEditCoupoun: async(req,res)=>{
        console.log("eeeeeeeeeeeeeeee"+req.params.id);
        const id = req.params.id
        console.log(req.body);

        const updatedName=req.body.couponName
        const updatedAmount = req.body.amount
        const updatedMinAmount = req.body.minPurchase
        const updatedExpireDate = req.body.expirydate
       
        

        let coup ={name:updatedName,amount:updatedAmount,minCartAmount:updatedMinAmount,expireDate:updatedExpireDate}
        
        console.log(coup);
       await  coupons.updateOne({_id:id},{
          $set:{
              name:coup.name,
              amount:coup.amount,
              minCartAmount:coup.minCartAmount,
              expireDate:coup.expireDate
              
          }
      })
      res.redirect('/admin/coupons')
    },
    AdminUserManagment:(req,res)=>{
      adminDatabase.getAllUsers((err,users)=>{
        res.render("admin/users",{users})
      })
    },

    BlockUser:async (req,res)=>{
      const id=req.params.id
      await user.findByIdAndUpdate(id,{access:false},{})
      res.redirect('/admin/users')
    },
    unblockUser: async (req,res)=>{
      const id = req.params.id
      await user.findByIdAndUpdate(id,{access:true},{})
      res.redirect('/admin/users')
    },
    orderDetailsPageView:async (req,res)=>{
      adminDatabase.getAllOrders((err,orders)=>{
        res.render("admin/order",{orders})
      })
    },
    changeStatus:(req,res)=>{
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
    },
    bannerDetailsView:async (req,res)=>{
      const banners= await banner.find()

      res.render("admin/banner",{banners})
    },
    addBanner:(req,res)=>{    
      adminDatabase.getAllCategory((err,categoryList)=>{
        res.render("admin/add-banner",{categoryList})
      })
    },
    postBanner:(req,res)=>{
      console.log(req.body);
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
          console.log(err);
          res.redirect("/admin/addBanner")
        }else{
          res.redirect("/admin/banner")
          
        }
      })
    
    },
    editBanner: async (req,res)=>{
      adminDatabase.getAllCategory(async (err,categoryList)=>{
        let banner =await adminDatabase.getBannerDetails(req.params.id)
      console.log(banner+"iugytdytryu");
      res.render('admin/edit-banner',{banner,categoryList})
      })
    },
    postEditBanner: async(req,res)=>{
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
  },
  disableBanner:async (req,res)=>{
    const id=req.params.id
    await banner.findByIdAndUpdate(id,{access:false},{})
    res.redirect('/admin/banner')
  },
  unableBanner: async (req,res)=>{
    const id = req.params.id
    await banner.findByIdAndUpdate(id,{access:true},{})
    res.redirect('/admin/banner')
  },
  salesReport:async (req,res)=>{
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
    console.log(sales);
    res.render('admin/day-report',{sales});
  },
  monthReport:async (req,res)=>{
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
  },
  yearReport:async (req,res)=>{
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
    console.log(sales);
    res.render('admin/year-report',{sales})
  },
  chart1: async (req, res) => {
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
  },

  chart2: async (req, res) => {
    // const months = 
      const payment = await orders2.aggregate([
        { $match: { status: { $eq: 'Delivered' } } },
        {
          $group: {
            _id: {

              payment: '$payment',

            },
            // totalPrice: { $sum: '$total' },
            // items: { $sum: { $size: '$products' } },
            count: { $sum: 1 },

          },
        }, { $sort: { '_id.month': -1 } }]);
        console.log(payment,"djfkls;a");
      res.json({ payment });
  },
    adminLogout:(req,res)=>{
      req.session.admin=null
      req.session.adloggedIn=false
      res.redirect('/admin/adlogin')
    }
}