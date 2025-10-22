const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().messages({
      "string.empty": "Title cannot be empty",
    }),
    description: Joi.string().required().messages({
      "string.empty": "Description cannot be empty",
    }),
    price: Joi.number().min(0).required().messages({
      "number.base": "Price must be a number",
      "number.min": "Price cannot be negative",
    }),
    location: Joi.string().required().messages({
      "string.empty": "Location cannot be empty",
    }),
    country: Joi.string().required().messages({
      "string.empty": "Country cannot be empty",
    }),
image: Joi.object({
  url: Joi.string().required().messages({
    "string.empty": "Image URL is required",
  }),
  filename: Joi.string().allow("", null),
}).required(),

  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required()
});
