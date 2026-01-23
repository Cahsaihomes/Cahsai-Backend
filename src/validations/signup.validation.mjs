import Joi from "joi";

export const baseUserSchema = Joi.object({
  first_name: Joi.string().min(3).max(100).required().messages({
    "string.base": "First name is required",
    "string.empty": "First name is required",
    "string.min": "First name must be at least {#limit} characters long",
    "string.max": "First name cannot exceed {#limit} characters",
    "any.required": "First name is required",
  }),
  last_name: Joi.string().min(3).max(100).required().messages({
    "string.base": "Last name is required",
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least {#limit} characters long",
    "string.max": "Last name cannot exceed {#limit} characters",
    "any.required": "Last name is required",
  }),
  user_name: Joi.string().min(3).max(100).required().messages({
    "string.base": "User name is required",
    "string.empty": "User name is required",
    "string.min": "User name must be at least {#limit} characters long",
    "string.max": "User name cannot exceed {#limit} characters",
    "any.required": "User name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  contact: Joi.string().min(8).max(15).required().messages({
    "string.empty": "Contact number is required",
    "string.min": "Contact number must be at least {#limit} digits",
    "string.max": "Contact number cannot exceed {#limit} digits",
    "any.required": "Contact number is required",
  }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(new RegExp("[0-9]"), "numbers")
    .pattern(new RegExp("[a-z]"), "lowercase")
    .pattern(new RegExp("[A-Z]"), "uppercase")
    .pattern(new RegExp("[^a-zA-Z0-9]"), "special")
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least {#limit} characters long",
      "string.pattern.name":
        "Password must contain at least one {#name} character",
    }),
  role: Joi.string()
    .valid("buyer", "agent", "admin", "creator")
    .required()
    .messages({
      "any.only": "Role must be one of [buyer, agent, admin, creator]",
      "string.empty": "Role is required",
      "any.required": "Role is required",
    }),
  acceptedTerms: Joi.boolean().required().messages({
    "any.only": "You must accept the terms and conditions",
    "any.required": "Terms acceptance is required",
  }),
  performancePoints: Joi.number().optional(),
  avatarUrl: Joi.string().optional(),
});

export const paymentDetailsSchema = Joi.object({
  userId: Joi.number().integer().required().messages({
    "any.only": "User Id is required",
    "any.required": "User Id is required",
  }),
  brokerageName: Joi.string().optional(),
  mlsLicenseNumber: Joi.string().optional(),
  mlsAssociation: Joi.string().optional(),
  cardHolderName: Joi.string().required().messages({
    "any.only": "Card Holder Name is required",
    "any.required": "Card Holder Name is required",
  }),
  cardNumber: Joi.string().creditCard().required().messages({
    "any.only": "Card Number is required",
    "any.required": "Card Number is required",
  }),
  // cardCvv: Joi.string().length(3).required().messages({
  //   "any.only": "Card CVV is required",
  //   "any.required": "Card CVV is required",
  // }),
  cardBrand: Joi.string().optional(),
  cardExpiryDate: Joi.string().required().messages({
    "any.only": "Card Expiry (MM/YY) is required",
    "any.required": "Card Expiry (MM/YY) is required",
  }),
  // cardExpiryMonth: Joi.number().integer().min(1).max(12).optional(),
  // cardExpiryYear: Joi.number()
  //   .integer()
  //   .min(new Date().getFullYear())
  //   .optional(),
  billingAddress: Joi.string().required().messages({
    "any.only": "Billing Address is required",
    "any.required": "Billing Address is required",
  }),
});

export const agentSchema = Joi.object({
  userId: Joi.number().integer().required().messages({
    "any.only": "User Id is required",
    "any.required": "User Id is required",
  }),
  linkedinUrl: Joi.string().uri().optional(),
  instagramUsername: Joi.string().optional(),
  areasServed: Joi.array().items(Joi.string()).optional(),
  specializations: Joi.array().items(Joi.string()).optional(),
});

export const creatorSchema = Joi.object({
  userId: Joi.number().integer().required().messages({
    "any.only": "User Id is required",
    "any.required": "User Id is required",
  }),
  linkedinUrl: Joi.string().uri().optional(),
  brokerageName: Joi.string().optional(),
  mlsLicenseNumber: Joi.string().optional(),
  mlsAssociation: Joi.string().optional(),
  avatarUrl: Joi.string().optional(),
  instagramUsername: Joi.string().optional(),
  areasServed: Joi.array().items(Joi.string()).optional(),
  specializations: Joi.array().items(Joi.string()).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const paymentMethodSchema = Joi.object({
  cardHolderName: Joi.string().required().messages({
    "any.only": "Card Holder Name is required",
    "any.required": "Card Holder Name is required",
  }),
  cardNumber: Joi.string().creditCard().required().messages({
    "any.only": "Card Number is required",
    "any.required": "Card Number is required",
  }),
  cardCvv: Joi.string().length(3).required().messages({
    "any.only": "Card CVV is required",
    "any.required": "Card CVV is required",
  }),
  cardBrand: Joi.string().optional(),
  cardExpiryDate: Joi.string().required().messages({
    "any.only": "Card Expiry (MM/YYYY) is required",
    "any.required": "Card Expiry (MM/YYYY) is required",
  }),
  // cardExpiryMonth: Joi.number().integer().min(1).max(12).optional(),
  // cardExpiryYear: Joi.number()
  //   .integer()
  //   .min(new Date().getFullYear())
  //   .optional(),
  billingAddress: Joi.string().required().messages({
    "any.only": "Billing Address is required",
    "any.required": "Billing Address is required",
  }),
});

export const bankDetailsSchema = Joi.object({
  cardHolderName: Joi.string().required().messages({
    "any.only": "Card Holder Name is required",
    "any.required": "Card Holder Name is required",
  }),
  cardNumber: Joi.string().creditCard().required().messages({
    "any.only": "Card Number is required",
    "any.required": "Card Number is required",
  }),
  cardCvv: Joi.string().length(3).required().messages({
    "any.only": "Card CVV is required",
    "any.required": "Card CVV is required",
  }),
  cardBrand: Joi.string().optional(),
  cardExpiryDate: Joi.string().required().messages({
    "any.only": "Card Expiry (MM/YYYY) is required",
    "any.required": "Card Expiry (MM/YYYY) is required",
  }),
  billingAddress: Joi.string().optional(),
  routing_number: Joi.string().optional(),
  verification_documents: Joi.string().optional(),
  account_name: Joi.string().required().messages({
    "any.only": "Account Holder Name is required",
    "any.required": "Account Holder Name is required",
  }),
  account_type: Joi.string().required().messages({
    "any.only": "Account type is required",
    "any.required": "Account type is required",
  }),
  bank_name: Joi.string().required().messages({
    "any.only": "Bank name is required",
    "any.required": "bank name is required",
  }),
  iban: Joi.string().required().messages({
    "any.only": "Iban or account number is required",
    "any.required": "Iban or account number is required",
  }),
  currency: Joi.string().required().messages({
    "any.only": "Currency is required",
    "any.required": "Currency is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  phone_number: Joi.string().min(8).max(15).required().messages({
    "string.empty": "Phone number is required",
    "string.min": "Phone number must be at least {#limit} digits",
    "string.max": "Phone number cannot exceed {#limit} digits",
    "any.required": "Phone number is required",
  }),
});
