const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    default: "Untitled Listing"   // <--- Default added
  },

  description: {
    type: String,
    default: ""
  },

  image: {
    filename: String,
    url: {
      type: String,
      default: "https://via.placeholder.com/800x600",
      set: v => v === "" ? "https://via.placeholder.com/800x600" : v
    }
  },

  price: {
    type: Number,
    default: 0,        // <--- Default added
    min: 0
  },

  location: String,
  country: String
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
