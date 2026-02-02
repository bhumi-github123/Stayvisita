const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");

// ---------------- REVIEWS ----------------

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// CREATE REVIEW
router.post(
  "/",
  validateReview,
  async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id);
      const newReview = new Review(req.body.review);

      listing.reviews.push(newReview);

      await newReview.save();
      await listing.save();
      req.flash("success", "New Review created!");
      res.redirect(`/listings/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE REVIEW
router.delete(
  "/:reviewId",
  async (req, res, next) => {
    try {
      const { id, reviewId } = req.params;

      await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
      });

      await Review.findByIdAndDelete(reviewId);
      req.flash("success", "Review Deleted!");
      res.redirect(`/listings/${id}`);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;