const express=require("express");
const router=express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const Review =require("../models/review.js");
const {validateReview,isLoggedIn,isReviewAuthor}=require("../views/middleware.js");
const reviewController=require("../controllers/reviews.js");

router.post("/",validateReview, wrapAsync(reviewController.createReview));
//delete review route

router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports=router;