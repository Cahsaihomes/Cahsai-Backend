import Joi from "joi";

export const createPostValidation = Joi.object({
  title: Joi.string().allow("", null),

  price: Joi.alternatives()
    .try(Joi.number().precision(2), Joi.string().pattern(/^\d+(\.\d+)?$/))
    .allow("", null),

  zipCode: Joi.string().allow("", null),
  city: Joi.string().allow("", null),
  location: Joi.string().allow("", null),

  description: Joi.string().allow("", null),

  bedrooms: Joi.alternatives()
    .try(Joi.number().integer(), Joi.string().pattern(/^\d+$/))
    .allow("", null),

  bathrooms: Joi.alternatives()
    .try(Joi.number().integer(), Joi.string().pattern(/^\d+$/))
    .allow("", null),

  tags: Joi.string().allow("", null),
  amenities: Joi.string().allow("", null),
  homeStyle: Joi.string().allow("", null),

  // ✅ RENTAL FIELDS
  listing_type: Joi.string().valid("FOR_SALE", "FOR_RENT", "STAY"),
  monthly_rent: Joi.alternatives()
    .try(Joi.number(), Joi.string().allow("", null)),
  security_deposit: Joi.alternatives()
    .try(Joi.number(), Joi.string().allow("", null)),
  lease_term: Joi.string().allow("", null),
  available_from: Joi.date().allow("", null),
  pet_policy: Joi.string().allow("", null),
  parking: Joi.string().allow("", null),
  furnished: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid("true", "false")),
  application_url: Joi.string().allow("", null),
  manager_id: Joi.alternatives()
    .try(Joi.number(), Joi.string().allow("", null)),
  is_verified_manager: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid("true", "false")),
})
.options({ allowUnknown: true });



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
