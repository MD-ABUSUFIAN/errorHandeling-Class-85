const Joi = require("joi");
const { customError } = require("../../src/helpers/customError");

const variantValidationSchema = Joi.object(
  {
    variantName: Joi.string()
      .trim()
      .min(3)
      .max(50)
      .required()
      .messages({
        "string.base": "Variant name must be text",
        "string.min": "Variant name must be at least 3 characters long",
        "string.max": "Variant name cannot be more than 50 characters",
        "any.required": "Variant name is required",
      }),

    product: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/) // ✅ validate MongoDB ObjectId format
      .required()
      .messages({
        "string.pattern.base": "Product ID must be a valid MongoDB ObjectId",
        "any.required": "Product ID is required",
      }),

    sku: Joi.string().trim().required().messages({
      "string.base": "SKU must be text",
      "any.required": "SKU is required",
    }),
    size: Joi.string().trim().required().messages({
      "string.base": "size must be text",
      "any.required": "size is required",
    }),
    color: Joi.string().trim().required().messages({
      "string.base": "color must be text",
      "any.required": "color is required",
    }),

    stockVariant: Joi.number().min(0).required().messages({
      "number.base": "Stock must be a number",
      "number.min": "Stock cannot be negative",
      "any.required": "Stock is required",
    }),

    purchasePrice: Joi.number().min(0).required().messages({
      "number.base": "Purchase price must be a number",
      "number.min": "Purchase price cannot be negative",
      "any.required": "Purchase price is required",
    }),

    retailPrice: Joi.number().min(0).required().messages({
      "number.base": "Retail price must be a number",
      "number.min": "Retail price cannot be negative",
      "any.required": "Retail price is required",
    }),
  },
  { abortEarly: true }
).unknown(true);

exports.validateVariant = async (req) => {
  try {
    const value = await variantValidationSchema.validateAsync(req.body);

    // ✅ Image Validation (at least 1 image required)
    const images = req?.files?.image || [];
    const allowFormat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (!Array.isArray(images) || images.length === 0) {
      throw new customError(401, "At least one variant image is required");
    }

    if (images.length > 5) {
      throw new customError(401, "Maximum 5 images allowed for a variant");
    }

    for (const img of images) {
      if (img.size > 2 * 1024 * 1024) {
        throw new customError(401, `Image ${img.originalname} exceeds 2MB`);
      }

      if (!allowFormat.includes(img.mimetype)) {
        throw new customError(
          401,
          `Invalid format for ${img.originalname}. Allowed: jpg, jpeg, png, webp`
        );
      }
    }

    return { ...value, images };
  } catch (error) {
    if (!error.details) {
      throw new customError(
        401,
        "Validation failed: " + (error.message || error)
      );
    }

    throw new customError(
      401,
      "Variant validation error: " +
        error.details.map((err) => err.message).join(", ")
    );
  }
};
