const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  if (response.body.features && response.body.features.length > 0) {
    req.body.listing.geometry = response.body.features[0].geometry;
  }
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.geometry = response.body.features[0].geometry;
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to edit this listing.");
    return res.redirect(`/listings/${id}`);
  }
  // ----- THIS PART IS NEW AND FIXES YOUR ISSUE -----
  const updatedData = req.body.listing;
  // If the location has changed, geocode the new location
  if (updatedData.location && updatedData.location !== listing.location) {
    const geoRes = await geocodingClient
      .forwardGeocode({
        query: updatedData.location,
        limit: 1,
      })
      .send();
    if (geoRes.body.features && geoRes.body.features.length > 0) {
      updatedData.geometry = geoRes.body.features[0].geometry;
    } else {
      updatedData.geometry = listing.geometry; // fallback to previous geometry
    }
  }
  await Listing.findByIdAndUpdate(id, updatedData);
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to delete this listing.");
    return res.redirect(`/listings/${id}`);
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
