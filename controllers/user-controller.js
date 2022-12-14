module.exports={
    userLogin :(req, res) => {
        res.render("user/login" );
    },
    userRegistration:(req,res)=>{
        res.render("user/registration")
    }
}