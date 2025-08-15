const Listing=require("../models/listing.js");
module.exports.index= async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
}

module.exports.renderNewForm=(req,res)=>{
    console.log(req.user);
    res.render('listings/new.ejs');
}

module.exports.createListing=async (req,res,next)=>{
     let url=req.file.path;
     let filename=req.file.filename;
     let newListing=new Listing(req.body.listing);
     newListing.owner=req.user._id;
     newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New listing created!");
    res.redirect('/listings');
}

module.exports.editForm=async(req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    if(!listing){
    req.flash("error","This listing does not exists!");
    res.redirect("/listings")
    }
    let originalImage=listing.image.url;
    originalImage = originalImage.replace("/upload","/upload/w_250");
    res.render("./listings/edit.ejs",{listing,originalImage});
}
module.exports.updateListing=async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(typeof req.file!== 'undefined'){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    if (!listing.owner.equals(res.locals.curruser._id)) {
      req.flash("error", "You don't have permission to edit!");
      return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
  }
module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id)
    .populate({
      path: "reviews",
      populate:{
        path: "author",
      },
    })
    .populate("owner");
    if(!listing){
    req.flash("error","This listing does not exists!");
    return res.redirect("/listings")
    }
    console.log(listing);
    res.render("./listings/show.ejs",{ listing, curruser: req.user });
}

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","listing deleted!");
    res.redirect("/listings");
}