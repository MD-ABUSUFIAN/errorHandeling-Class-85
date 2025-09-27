const Joi = require("joi");
const { customError } = require("../../src/helpers/customError");

const couponValidationSchema = Joi.object(
  {
    code: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages({
        "string.base": "Coupon code must be in text format",
        "string.min": "Coupon code must be at least 3 characters long",
        "string.max": "Coupon code cannot be more than 30 characters",
        "any.required": "Coupon code is required",
      }),

    discountType: Joi.string()
      .valid("percentage", "tk")
      .required()
      .messages({
        "any.only": "Discount type must be either 'percentage' or 'tk'",
        "any.required": "Discount type is required",
      }),

    discountValue: Joi.number()
      .min(1)
      .required()
      .messages({
        "number.base": "Discount value must be a number",
        "number.min": "Discount value must be greater than 0",
        "any.required": "Discount value is required",
      }),

    expireAt: Joi.date()
      .greater("now")
      .required()
      .messages({
        "date.base": "Expire date must be a valid date",
        "date.greater": "Expire date must be in the future",
        "any.required": "Expire date is required",
      }),

    usageLimit: Joi.number()
      .min(0)
      .messages({
        "number.base": "Usage limit must be a number",
        "number.min": "Usage limit cannot be negative",
      }),

    usedCount: Joi.number()
      .min(0)
      .messages({
        "number.base": "Used count must be a number",
        "number.min": "Used count cannot be negative",
      }),

    isActive: Joi.boolean().default(true),
  },
  { abortEarly: true }
).unknown(true);

exports.validateCoupon = async (req) => {
  try {
    const value = await couponValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    if (!error.details) {
      throw new customError(
        401,
        "Error from coupon validation: " + (error.message || error)
      );
    }

    throw new customError(
      401,
      "Coupon validation error: " +
        error.details.map((err) => err.message).join(", ")
    );
  }
};
