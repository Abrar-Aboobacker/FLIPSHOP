

const adminVerifyLogin =(req,res,next)=>{
    if(req.session.adloggedIn){
        next()
    }else{
        res.redirect('/admin/adlogin')
    }
}
module.exports={
    adminVerifyLogin
}