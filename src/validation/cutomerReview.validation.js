const Joi = require("joi");
const { customError } = require("../helpers/customError");

const reviewValidationSchema = Joi.object(
  {
    reviewerid: Joi.string().trim().required().messages({
      "any.required": "Reviewer ID is required",
      "string.base": "Reviewer ID must be a valid string",
    }),

    comment: Joi.string().trim().max(500).allow("").messages({
      "string.max": "Comment cannot be longer than 500 characters",
      "string.base": "Comment must be text",
    }),

    rating: Joi.number().required().min(0).max(5).messages({
      "any.required": "Rating is required",
      "number.base": "Rating must be a number",
      "number.min": "Rating cannot be less than 0",
      "number.max": "Rating cannot be more than 5",
    }),
     productId: Joi.string().trim().required().messages({
      "any.required": "product ID is required",
      "string.base": "product ID must be a valid string",
    })
  },
  { abortEarly: true }
).unknown(true); // allow extra fields if needed

exports.validateReview = async (req) => {
  try {
    const value = await reviewValidationSchema.validateAsync(req.body);

    // ✅ Validate images if uploaded
    const images = req?.files?.image;
    const allowFormat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

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
        "error from validation " + (error.message || error)
      );
    }

    throw new customError(
      401,
      "Review validation error: " +
        error.details.map((err) => err.message).join(", ")
    );
  }
};
