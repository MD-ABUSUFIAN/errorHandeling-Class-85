const Joi = require("joi");
const { customError } = require("../../src/helpers/customError");

const discountValidationSchema = Joi.object(
  {
    discountName: Joi.string()
      .trim()
      .min(3)
      .max(50)
      .required()
      .messages({
        "string.base": "Discount name must be in text format",
        "string.min": "Discount name must be at least 3 characters long",
        "string.max": "Discount name cannot be more than 50 characters",
        "any.required": "Discount name is required",
      }),

    discountType: Joi.string()
      .valid("tk", "%")
      .required()
      .messages({
        "any.only": "Discount type must be either 'tk' or '%'",
        "any.required": "Discount type is required",
      }),

    discountValueByAmount: Joi.number()
      .min(0)
      .messages({
        "number.base": "Discount value by amount must be a number",
        "number.min": "Discount value by amount cannot be negative",
      }),

    discountValueByPercent: Joi.number()
      .min(0)
      .max(100)
      .messages({
        "number.base": "Discount value by percent must be a number",
        "number.min": "Discount percent cannot be negative",
        "number.max": "Discount percent cannot exceed 100",
      }),

    discountPlan: Joi.string()
      .valid("category", "subCategory", "product")
      .required()
      .messages({
        "any.only":
          "Discount plan must be either 'category', 'subCategory', or 'product'",
        "any.required": "Discount plan is required",
      }),

    discountValidFrom: Joi.date().required().messages({
      "date.base": "Discount valid from must be a valid date",
      "any.required": "Discount valid from is required",
    }),

    discountValidTo: Joi.date().required().messages({
      "date.base": "Discount valid to must be a valid date",
      "any.required": "Discount valid to is required",
    }),

    category: Joi.string().optional().allow(null, ""),
    subCategory: Joi.string().optional().allow(null, ""),
    product: Joi.string().optional().allow(null, ""),

    isActive: Joi.boolean().default(true),
  },
  { abortEarly: true }
).unknown(true);

exports.validateDiscount = async (req) => {
  try {
    const value = await discountValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    if (!error.details) {
      throw new customError(
        401,
        "Error from discount validation: " + (error.message || error)
      );
    }

    throw new customError(
      401,
      "Discount validation error: " +
        error.details.map((err) => err.message).join(", ")
    );
  }
};
