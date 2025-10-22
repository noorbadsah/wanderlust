const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn } = require("../middleware.js");
const reviewController = require("../controllers/review.js");

// Validation middleware
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  }
  next();
};

// Create Review
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete Review
router.delete("/:reviewId", isLoggedIn, wrapAsync(reviewController.deleteReview));

module.exports = router;
