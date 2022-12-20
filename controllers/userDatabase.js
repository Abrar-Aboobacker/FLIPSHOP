const users =require ('../models/user')
const bcrypt=require('bcrypt')
// var salt = bcrypt.genSaltSync(10);
// var hash = bcrypt.hashSync("B4c0/\/", salt);

module.exports={
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let user=await users.findOne({email:userData.email})
            
            if(user){
                
                bcrypt.compare(userData.pass,user.password).then((status)=>{
                    if(status){
                        response.user=user
                        response.status=true
                        resolve(response)
                        console.log('success');
                    }else{
                        resolve({status:false})
                        console.log('failed');
                    }
                })
            }else{
                resolve({status:false})
                console.log('didnt exist');
            }
        })
    },
    // getAllUsers:()=>{
    //     return new Promise(async(resolve,reject)=>{
    //             users.find().where()
    //         resolve(users)
    //     })
    // },
}