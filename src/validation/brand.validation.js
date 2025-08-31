const Joi = require("joi");
const { customError } = require("../../src/helpers/customError");

const brandValidationSchema = Joi.object(
  {
    name: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages({
        "string.base": "Name must be in text format",
        "string.min": "Name must be at least 3 characters long",
        "string.max": "Name cannot be more than 30 characters",
        "string.trim": "Spaces are not allowed",
        "any.required": "Name is required",
      }),
  },
  { abortEarly: true }
).unknown(true);

exports.validateBrand = async (req) => {
  try {
    const value = await brandValidationSchema.validateAsync(req.body);

    const image = req?.files?.image?.[0];
    const allowFormat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (!image) {
      throw new customError(401, "Brand image is required");
    }

    if (Array.isArray(req?.files?.image) && req.files.image.length > 1) {
      throw new customError(401, "Only one image is allowed");
    }

    if (image.size > 2 * 1024 * 1024) {
      throw new customError(401, "Image MAX size is 2MB");
    }

    if (!allowFormat.includes(image?.mimetype)) {
      throw new customError(
        401,
        "Image format not accepted. Try jpg, jpeg, png or webp"
      );
    }

    // ✅ sanitize image 
    return { name: value.name, image:image };
  } catch (error) {
    if (!error.details) {
      throw new customError(401,"error from validation"+ error.message || error);
    }

    throw new customError(
      401,
      "Brand validation error: " +
        error.details.map((err) => err.message).join(", ")
    );
  }
};
