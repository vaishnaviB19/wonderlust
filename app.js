if(process.env.NODE_ENV != "production"){
     const dotenv=require("dotenv").config();
}
const express=require('express');
const app=express();

const mongoose=require('mongoose');
const path=require('path');
const methodOverride=require('method-override');
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/expressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js")

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/reviews.js");
const userRouter=require("./routes/user.js");
const { error } = require("console");

app.set("view engine",'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const mongo_URL=process.env.MONGODB_URL;
main()
.then(()=>{console.log("connected to db")})
.catch((err)=>{console.log(err)});
async function main() {
    await mongoose.connect(mongo_URL);
}

const store=MongoStore.create({
    mongoUrl:mongo_URL,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
})

store.on("error",()=>{
    console.log("Error in MONGO SESSION STORE",err);
})
const sessionOptions = {
    // store: MongoStore.create({ mongoUrl: mongo_URL }),
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now()+ 1000*60*60*24*3,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 *7 // 7 day

    }
};


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success= req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.curruser=req.user;
    next();
})
// app.get('/',wrapAsync((req,res)=>{
//     res.send('Hi,I am root');
// }));
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);



app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next)=>{
    if (res.headersSent) {
        return next(err); 
    }
    let {statuscode=500,message="Something Went Wrong!"}=err;
    res.status(statuscode).render("error.ejs", { err });
})

app.listen(3000,()=>{
    console.log("listening on port 3000");
})