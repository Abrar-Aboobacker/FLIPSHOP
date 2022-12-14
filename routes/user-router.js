const express = require('express')
const res = require('express/lib/response')
const router = express.Router()
const {userLogin,userRegistration}=require ('../controllers/user-controller')


router.get('/login',userLogin)
router.get('/registration',userRegistration)

module.exports =  router