const Listing = require("../models/listing.js");
const cloudinary = require("../cloudConfig.js");

// Index
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};

// Render New Form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Create Listing
module.exports.createListing = async (req, res, next) => {
    try {
        let image = null;

        if (req.file) {
            // Upload to Cloudinary from memory
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "wonderlust_DEV",
                        allowed_formats: ["png", "jpg", "jpeg"],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            image = { url: result.secure_url, filename: result.public_id };
        }

        let newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        if (image) newListing.image = image;

        await newListing.save();
        req.flash("success", "New listing created!");
        res.redirect("/listings");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to create listing");
        res.redirect("/listings");
    }
};

// Edit Form
module.exports.editForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "This listing does not exist!");
        return res.redirect("/listings");
    }
    let originalImage = listing.image?.url || "";
    if (originalImage) {
        originalImage = originalImage.replace("/upload", "/upload/w_250");
    }
    res.render("./listings/edit.ejs", { listing, originalImage });
};

// Update Listing
module.exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        if (!listing.owner.equals(res.locals.curruser._id)) {
            req.flash("error", "You don't have permission to edit!");
            return res.redirect(`/listings/${id}`);
        }

        // If a new file is uploaded
        if (req.file) {
            // Delete old image from Cloudinary if exists
            if (listing.image?.filename) {
                await cloudinary.uploader.destroy(listing.image.filename);
            }

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "wonderlust_DEV",
                        allowed_formats: ["png", "jpg", "jpeg"],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            listing.image = { url: result.secure_url, filename: result.public_id };
        }

        // Update other listing fields
        listing.set(req.body.listing);
        await listing.save();

        req.flash("success", "Listing updated");
        res.redirect(`/listings/${listing._id}`);

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update listing");
        res.redirect("/listings");
    }
};

// Show Listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "This listing does not exist!");
        return res.redirect("/listings");
    }

    res.render("./listings/show.ejs", { listing, curruser: req.user });
};

// Delete Listing
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    // Optional: Delete image from Cloudinary
    if (deletedListing?.image?.filename) {
        await cloudinary.uploader.destroy(deletedListing.image.filename);
    }

    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
};
