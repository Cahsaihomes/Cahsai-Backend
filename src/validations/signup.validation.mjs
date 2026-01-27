import Joi from "joi";

export const baseUserSchema = Joi.object({
  first_name: Joi.string().max(100).optional(),
  last_name: Joi.string().max(100).optional(),
  user_name: Joi.string().max(100).optional(),
  email: Joi.string().email().optional(),
  contact: Joi.string().optional(),
  password: Joi.string().optional(),
  role: Joi.string()
    .valid("buyer", "agent", "admin", "creator")
    .optional(),
  acceptedTerms: Joi.boolean().optional(),
  performancePoints: Joi.number().optional(),
  avatarUrl: Joi.string().optional(),
});

export const paymentDetailsSchema = Joi.object({
  userId: Joi.number().integer().optional().messages({
    "any.only": "User Id is required",
    "any.required": "User Id is required",
  }),
  brokerageName: Joi.string().optional(),
  mlsLicenseNumber: Joi.string().optional(),
  mlsAssociation: Joi.string().optional(),
  cardHolderName: Joi.string().optional().messages({
    "any.only": "Card Holder Name is required",
    "any.required": "Card Holder Name is required",
  }),
  cardNumber: Joi.string().creditCard().optional().messages({
    "any.only": "Card Number is required",
    "any.required": "Card Number is required",
  }),
  // cardCvv: Joi.string().length(3).required().messages({
  //   "any.only": "Card CVV is required",
  //   "any.required": "Card CVV is required",
  // }),
  cardBrand: Joi.string().optional(),
  cardExpiryDate: Joi.string().optional().messages({
    "any.only": "Card Expiry (MM/YY) is required",
    "any.required": "Card Expiry (MM/YY) is required",
  }),
  // cardExpiryMonth: Joi.number().integer().min(1).max(12).optional(),
  // cardExpiryYear: Joi.number()
  //   .integer()
  //   .min(new Date().getFullYear())
  //   .optional(),
  billingAddress: Joi.string().optional().messages({
    "any.only": "Billing Address is required",
    "any.required": "Billing Address is required",
  }),
});

export const agentSchema = Joi.object({
  userId: Joi.number().integer().required().messages({
    "any.only": "User Id is required",
    "any.required": "User Id is required",
  }),
  linkedinUrl: Joi.string().uri().allow('').optional(),
  instagramUsername: Joi.string().allow('').optional(),
  areasServed: Joi.array().items(Joi.string()).optional(),
  specializations: Joi.array().items(Joi.string()).optional(),
});

export const creatorSchema = Joi.object({
  userId: Joi.number().integer().required().messages({
    "any.only": "User Id is required",
    "any.required": "User Id is required",
  }),
  linkedinUrl: Joi.string().uri().allow('').optional(),
  brokerageName: Joi.string().allow('').optional(),
  mlsLicenseNumber: Joi.string().allow('').optional(),
  mlsAssociation: Joi.string().allow('').optional(),
  avatarUrl: Joi.string().allow('').optional(),
  instagramUsername: Joi.string().allow('').optional(),
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
