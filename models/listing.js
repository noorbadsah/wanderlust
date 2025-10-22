const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js"); // Ensure this is named properly
// If your User model file is named 'user.js', use correct path:
const User = require("./user.js"); // Import User model

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },
  image: {
    url: { type: String, required: true },
    filename: { type: String, default: "default" },
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review", // Reference should match your Review model name
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference the singular 'User' model; not 'userss'
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
});

// Pre-validation: fill defaults if missing
listingSchema.pre("validate", function (next) {
  if (!this.description?.trim()) this.description = "No description provided";
  if (!this.location?.trim()) this.location = "Unknown location";
  if (!this.country?.trim()) this.country = "Unknown country";
  if (!this.price || isNaN(this.price)) this.price = 0;

  if (!this.image) this.image = {};
  if (!this.image.url?.trim()) {
    this.image.url =
      "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60";
  }
  if (!this.image.filename?.trim()) this.image.filename = "default";

  if (!this.geometry || !Array.isArray(this.geometry.coordinates)) {
    this.geometry = { type: "Point", coordinates: [0, 0] };
  } else if (
    this.geometry.coordinates.length !== 2 ||
    this.geometry.coordinates.some((c) => typeof c !== "number")
  ) {
    this.geometry.coordinates = [0, 0];
  }

  next();
});

// Cascade delete reviews if listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema); // Mongoose will create 'listings' collection
