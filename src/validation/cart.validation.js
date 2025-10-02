const Joi = require("joi");
const { customError } = require("../../src/helpers/customError");

const cartValidationSchema = Joi.object(
  {
    user: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .allow(null, "")
      .messages({
        "string.pattern.base": "User ID must be a valid ObjectId",
      }),

    guestId: Joi.string()
      .trim()
      .optional()
      .messages({
        "string.base": "Guest ID must be in text format",
      }),

    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .allow(null, "")
            .messages({
              "string.pattern.base": "Product ID must be a valid ObjectId",
              "any.required": "Product ID is required",
            }),

          variant: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional()
            .required()
            .allow(null, "")
            .messages({
              "string.pattern.base": "Variant ID must be a valid ObjectId",
              "any.required": "Variant ID is required",
            }),

          quantity: Joi.number()
            .min(1)
            .required()
            .messages({
              "number.base": "Quantity must be a number",
              "number.min": "Quantity must be at least 1",
              "any.required": "Quantity is required",
            }),

          size: Joi.string()
            .optional()
            .messages({
              "string.base": "Size must be a text value",
            }),

          color: Joi.string()
            .optional()
            .messages({
              "string.base": "Color must be a text value",
            }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.base": "Items must be an array",
        "array.min": "At least one item is required",
        "any.required": "Items are required",
      }),

    coupon: Joi.string()
      // .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        "string.pattern.base": "Coupon ID must be a valid ObjectId",
      }),

  },
  { abortEarly: true }
).unknown(true);

exports.validateCart = async (req) => {
  try {
    const value = await cartValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    if (!error.details) {
      throw new customError(
        401,
        "Error from cart validation: " + (error.message || error)
      );
    }

    throw new customError(
      401,
      "Cart validation error: " +
        error.details.map((err) => err.message).join(", ")
    );
  }
};