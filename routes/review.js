const express = require("express");
const router = express.Router({ mergeParams: true});
const { isLoggedIn } = require("../middleware.js");

const Review = require("../models/review.js")
const {reviewSchema} = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
};


//Reviews
router.post("/listings/:id/reviews", isLoggedIn,validateReview, wrapAsync(async(req, res) => {
    let {id} = req.params
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview)

    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created")
    res.redirect(`/listings/${id}`);
}));

//Delete route
router.delete("/listings/:id/reviews/:reviewId",isLoggedIn, wrapAsync(async (req, res) => {
    let { id, reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;