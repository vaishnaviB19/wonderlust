const Listing=require('../models/listing');
const ExpressError=require("../utils/expressError.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const Review = require('../models/review.js');

module.exports.validateListing=(req,res,next)=>{
    // let {title,description,image,price,location,country}=req.body;
    let {error} =listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}
module.exports.validateReview=(req,res,next)=>{
    // let {title,description,image,price,location,country}=req.body;
    let {error} =reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectURL = req.originalUrl;
        req.flash("error","You must be logged in to create listing!");
       return res.redirect("/login");
    };
    next();
}
module.exports.saveRedirectURL = (req, res, next) => {
    if (req.session.redirectURL) {
        res.locals.redirectURL = req.session.redirectURL;
        delete req.session.redirectURL; // optional cleanup
    }
    next();
};

module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review= await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.curruser._id)){
        req.flash("error","You are not the author of ths review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

