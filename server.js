if(process.env.NODE_ENV !=='production'){
    require('dotenv').config()
}
const express=require ('express');
const app =express();
const expresslayout= require('express-ejs-layouts');
const mongoose =require('mongoose')
const bodyparser = require('body-parser')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy
const nocache = require("nocache");
const cookieParser = require('cookie-parser')

const db = mongoose.connection
mongoose.set('strictQuery', true);


const userRouter = require ('./routes/user-router')
const adminRouter = require ('./routes/admin-router');

app.set("view engine","ejs");
app.set("views",__dirname +'/views');
// app.set ('layout','layouts/layout');
// app.use(expresslayout
app.use(express.static(__dirname + '/public'));

app.use(express.json())
app.use(express.urlencoded({extended:true}));
// app.use(express.json()),

app.use(flash())
app.use(session({secret:'key',
cookie:{maxAge:60000000},
resave: true,
saveUninitialized: true}));
app.use(cookieParser())

app.use(nocache());
mongoose.connect(process.env.DATABASE_URL);

db.on('error',error=> console.error(error));
db.once('open',()=> console.log('connected to mongoose'));



app.use('/',userRouter)
app.use('/admin',adminRouter)

app.listen(process.env.PORT || 3000, console.log("started "))
