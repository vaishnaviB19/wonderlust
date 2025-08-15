const express=require("express");
const router=express.Router({ mergeParams: true });
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectURL}=require("../views/middleware.js");
const userController=require("../controllers/user.js");

router.route("/signup")
.get(userController.renderSignupFrom)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginFrom)
.post(
    saveRedirectURL,
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    userController.login
);

router.get("/logout",userController.logout)
module.exports=router;