const express=require("express");
const router=express.Router();
const Listing=require('../models/listing');
const wrapAsync=require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../views/middleware.js");
const {validateListing}=require("../views/middleware.js");
const multer  = require('multer')
const {storage} =require("../cloudConfig.js");
const upload = multer({ storage })

const listingController =require("../controllers/listings.js");
//index route
//create route
router.route("/")
.get(wrapAsync(listingController.index))
.post(
      isLoggedIn,
      upload.single('listing[image]'), // handle file first
      validateListing,                 // then validate
      wrapAsync(listingController.createListing) // finally create listing
  );

//new route
router.get('/new',isLoggedIn,listingController.renderNewForm);

//show route
//update route
//delete route
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(validateListing,
  isLoggedIn,
  upload.single('listing[image]'),
  validateListing,    
  wrapAsync(listingController.updateListing))
.delete(isLoggedIn,wrapAsync(listingController.destroyListing))

//Edit route
router.get('/:id/edit',isLoggedIn,wrapAsync(listingController.editForm));
module.exports=router;