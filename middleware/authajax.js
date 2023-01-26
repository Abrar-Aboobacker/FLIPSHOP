

const AuthAjaxVerification=(req,res,next)=>{
    if(req.session.loggedIn){
        next()
    }else{
        res.json({ access: false })
    }
}
module.exports={
    AuthAjaxVerification
}
