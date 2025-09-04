const Joi = require("joi");
const { customError } = require("../helpers/customError");

const productValidationSchema = Joi.object(
  {
    name: Joi.string().trim().required().messages({
      "any.required": "Product name is required",
      "string.base": "Name must be text",
    }),

    purchasePrice: Joi.number().required().messages({
      "any.required": "Purchase price is required",
      "number.base": "Purchase price must be a number",
    }),

    retailPrice: Joi.number().required().messages({
      "any.required": "Retail price is required",
      "number.base": "Retail price must be a number",
    }),
  },
  { abortEarly: true }
).unknown(true); // ✅ allows other optional fields

exports.validateProduct = async (req) => {
  try {
    const value = await productValidationSchema.validateAsync(req.body);

    // ✅ Optional: validate images if uploaded
    const images = req?.files?.image;
    const allowFormat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (images && Array.isArray(images)) {
      images.forEach((img) => {
        if (img.size > 2 * 1024 * 1024) {
          throw new customError(401, "Each image MAX size is 2MB");
        }
        if (!allowFormat.includes(img.mimetype)) {
          throw new customError(
            401,
            "Image format not accepted. Try jpg, jpeg, png or webp"
          );
        }
      });
    }

    return value;
  } catch (error) {
    if (!error.details) {
      throw new customError(
        401,
        "error from validation " + (error.message || error)
      );
    }

    throw new customError(
      401,
      "Product validation error: " +
        error.details.map((err) => err.message).join(", ")
    );
  }
};
