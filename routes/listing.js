const express = require("express");
const router = express.Router({ mergeParams: true});
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({storage });


router.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    //console.log(allListings);
    res.render("listings/index.ejs", {allListings});
});

router.get("/listings/new",isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");

})

router.get("/listings/:id",async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    //console.log(listing);
    if(!listing){
        req.flash("error", "Does not found this Listing");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("Listings/show.ejs", {listing});
    
});


//Create Route
router.post("/listings", upload.single('listing[image]'),async (req, res) => {
 
    //let {title, description, price, country, location} = req.body;
    let listing = req.body;
    let url = req.file.path;
    let filename = req.file.filename;
    //console.log(url, "..", filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
    
});


//Edit Route
router.get("/listings/:id/edit", isLoggedIn,async (req, res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    };

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
});

router.put("/listings/:id",isLoggedIn, upload.single('listing[image]'),async (req, res)=> {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing });
    console.log(req.file);
    
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    };
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
});

router.delete("/listings/:id", isLoggedIn, async (req, res) => {
    let {id} = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings")
});

module.exports = router;