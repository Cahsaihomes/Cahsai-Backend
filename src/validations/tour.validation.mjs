import Joi from "joi";

export const createTourValidation = Joi.object({
  postId: Joi.number().integer().required().messages({
    "any.required": "Post ID is required.",
  }),
  agentId: Joi.number().integer().required().messages({
    "any.required": "Agent ID is required.",
  }),
  date: Joi.date().required().messages({
    "any.required": "Date is required.",
  }),
  time: Joi.string().required().messages({
    "any.required": "Time is required.",
  }),
});
