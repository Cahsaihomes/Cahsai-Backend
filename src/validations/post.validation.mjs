import Joi from "joi";

export const createPostValidation = Joi.object({
  title: Joi.string().allow("", null),
  price: Joi.number().precision(2).required().messages({
    "number.base": "Price must be a number.",
    "any.required": "Price is required.",
  }),
  zipCode: Joi.string().required().messages({
    "any.required": "Zip code is required.",
  }),
  city: Joi.string().required().messages({
    "any.required": "City is required.",
  }),
  location: Joi.string().required().messages({
    "any.required": "Location is required.",
  }),
  description: Joi.string().allow("", null),
  bedrooms: Joi.number().integer().required().messages({
    "number.base": "Bedrooms must be a number.",
    "any.required": "Bedrooms are required.",
  }),
  bathrooms: Joi.number().integer().required().messages({
    "number.base": "Bathrooms must be a number.",
    "any.required": "Bathrooms are required.",
  }),
  homeStyle: Joi.alternatives()
    .try(
      Joi.array().items(
        Joi.string().valid("Pet Friendly", "Modern Homes", "Budget Rooms")
      ),
      Joi.string().custom((value) => value.split(",").map((h) => h.trim()))
    )
    .optional(),
  tags: Joi.string().allow("", null),
  amenities: Joi.string().allow("", null),
});

export const updatePostValidation = Joi.object({
  price: Joi.number().precision(2).messages({
    "number.base": "Price must be a number.",
  }),
  zipCode: Joi.string().messages({
    "string.base": "Zip code must be a string.",
  }),
  city: Joi.string().messages({
    "string.base": "City must be a string.",
  }),
  location: Joi.string().messages({
    "string.base": "Location must be a string.",
  }),
  description: Joi.string().allow("", null),
  bedrooms: Joi.number().integer().messages({
    "number.base": "Bedrooms must be a number.",
  }),
  bathrooms: Joi.number().integer().messages({
    "number.base": "Bathrooms must be a number.",
  }),
  tags: Joi.string().allow("", null),
  amenities: Joi.string().allow("", null),
  homeStyle: Joi.array()
    .items(Joi.string().valid("Pet Friendly", "Modern Homes", "Budget Rooms"))
    .optional()
    .messages({
      "any.only": "Invalid HomeStyle option",
    }),

  video: Joi.string().allow(null),
  images: Joi.array().items(Joi.string()).allow(null),
});
