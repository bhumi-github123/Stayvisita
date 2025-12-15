// Importing required packages
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

// MongoDB connection
const MONGO_URL = "mongodb://127.0.0.1:27017/Stayvista";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

// ---------------- MIDDLEWARE ----------------

// EJS setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override
app.use(methodOverride("_method"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// ---------------- ROUTES ----------------

// Redirect root
app.get("/", (req, res) => {
  res.redirect("/listings");
});

const validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}

// INDEX
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// NEW
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// SHOW
app.get("/listings/:id", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.render("listings/show.ejs", { listing });
}));

// CREATE
app.post("/listings",
  validateListing, 
  wrapAsync(async (req, res) => {

  //  let result = listingSchema.validate(req.body);
  //  console.log(result);
  // if (result.error) {
  //   throw new ExpressError(400, result.error);
  // }

  // // Ensure image exists (default image support)
  // if (!req.body.listing.image) {
  //   req.body.listing.image = { url: "" };
  // }

  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

// EDIT
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.render("listings/edit.ejs", { listing });
}));

// UPDATE
app.put("/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.id, {
    ...req.body.listing
  });

  res.redirect(`/listings/${req.params.id}`);
}));

// DELETE
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.redirect("/listings");
}));

// ---------------- ERROR HANDLING ----------------

// 404
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Global error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Server
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
