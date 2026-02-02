const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// INDEX
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// NEW
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// SHOW
router.get("/:id", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("reviews").populate("owner");

  if (!listing) {
    req.flash("error", "Requested listing does not exist!");
    return res.redirect("/listings"); // ✅ VERY IMPORTANT
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
}));

// CREATE
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
}));


// EDIT
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
    if (!listing) {
    req.flash("error", "Requested listing does not exist!");
    return res.redirect("/listings"); // ✅ VERY IMPORTANT
  }
  res.render("listings/edit.ejs", { listing });
}));

// UPDATE
router.put("/:id", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.id, {
    ...req.body.listing,
  });
  res.redirect(`/listings/${req.params.id}`);
}));

// ✅ DELETE LISTING 
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
  // MUST use findOneAndDelete so post middleware runs
  await Listing.findOneAndDelete({ _id: req.params.id });
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}));

module.exports = router;

