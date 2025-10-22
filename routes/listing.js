const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const { storage } = require("../cloudConfig.js");
const multer = require("multer");
const upload = multer({ storage });

// Middleware: attach image field from upload or old listing (for edits)
const attachImageToBody = async (req, res, next) => {
  if (!req.body.listing) req.body.listing = {};
  if (req.file) {
    req.body.listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  } else if (req.params.id) {
    // Keep old image if no new one is uploaded
    const listing = await Listing.findById(req.params.id);
    if (listing && listing.image) {
      req.body.listing.image = listing.image;
    }
  }
  next();
};

// Validation for listing
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// All listings & Create listing
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("image"),
    attachImageToBody,
    validateListing,
    wrapAsync(listingController.createListing)
  );

// Form for new listing
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Single listing operations (show, update, delete)
router
  .route("/:id")
  .get(
    wrapAsync(async (req, res) => {
      const { id } = req.params;
      const listing = await Listing.findById(id)
        .populate({
          path: "reviews",
          populate: { path: "author" },
        })
        .populate("owner");

      if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
      }

      res.render("listings/show", { listing });
    })
  )
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    attachImageToBody,
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
  );

// Edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;