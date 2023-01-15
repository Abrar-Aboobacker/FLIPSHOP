postReset:(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
     if(err){
       return res.redirect('/reset');
     }
     const token = buffer.toString('hex')
     User.findOne({email:req.body.email}).then(users=>{
       if(!users){
       return  res.redirect('/reset')
       }
       users.resetToken = token;
       users.resetTokenExpiration = Date.now() + 3600000;
       return users.save();
     })
 
     .then(result =>{
       res.redirect('/');
       var emails = {
         to: [result.email],
         from: 'rameezp2011@gmail.com',
         subject: 'password reseted',
         html: `
           <p>You Requested  a Password reset </p>
            <p>Click this <a href="http://localhost:7000/resets?token=${token}">link</a> to set a passwor</p>
    `
     };
     mailer.sendMail(emails, function(err, res) {
       if (err) { 
           console.log(err) 
       }else{
         console.log(res.response
           +'email sended');
       }
     })
    }) .catch(err=>{
     console.log(err);
 });
 })
 }

 getNewPassword : (req,res)=>{ 
    const token = req.query.token;
    User.findOne({resetToken:token,resetTokenExpiration:{$gt:Date.now()}}).then(users=>{
      res.render('user/new-password',{userid:users._id,passwordToken:token})
    }).catch(err =>{
      console.log(err);
    })
 }
 postResetPassword:(req,res)=>{ 
    let updatedUser;
   const newpassword = req.body.password;
   const userId = req.body.userid;
   const passwordToken = req.body.passwordToken
    User.findOne({
        resetToken:passwordToken,
        resetTokenExpiration:{$gt:Date.now()},
        _id:userId}).then(users=>{
      updatedUser = users
     return bcrypt.hash(newpassword,12)
    }).then(hashedpassword=>{
      updatedUser.password = hashedpassword
      updatedUser.conform = hashedpassword
      updatedUser.resetToken=undefined
      updatedUser.resetTokenExpiration = undefined
      return updatedUser.save()
    }).then(result=>{
      res.redirect('/log')
    })
  
  }
  const crypto = require('crypto');
  const nodemailer = require('nodemailer');
  const { findOneAndUpdate } = require('../models/user');
  
  const mailer = nodemailer.createTransport({
      host:'smtp-relay.sendinblue.com',
      port:587,
      auth:{
          user:'rameezp2011@gmail.com',
          pass:'ravVF0ZGqPD9gxAh'
      }
  })