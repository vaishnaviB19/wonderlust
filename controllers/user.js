const User=require("../models/user.js");
module.exports.renderSignupFrom=(req,res)=>{
    res.render("users/signup.ejs");
}
module.exports.signup=async (req,res)=>{
    try{
   let {username,email,password}=req.body;
   const newUser= new User({email,username});
   const registeredUser =await User.register(newUser,password);
   console.log(registeredUser);
   req.login(registeredUser,(err)=>{
    if(err){
        next(err);
    }
    req.flash("success","welcome to Wonderlust!");
    res.redirect("/listings");
   })
   
    }catch(error){
        req.flash("error",error.message);
        res.redirect("/signup");
    }
}
module.exports.renderLoginFrom=(req,res)=>{
    res.render("users/login.ejs");
}
module.exports.login=(req, res) => {
        req.flash("success", "Welcome back to Wonderlust!");
        const redirectURL = res.locals.redirectURL || "/listings";
        res.redirect(redirectURL);
    }
module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
        return next(err);
        }
        req.flash("success","You are successefully logged out!");
        res.redirect("/listings");
    })
    
}