const Joi = require("joi");
const mongoose = require("mongoose");
const { customError } = require("../helpers/customError");

// ✅ Custom validator for ObjectId
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

// ✅ Joi Schema for SubCategory
const subCategoryValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name should have at least {#limit} characters",
      "string.max": "Name should not exceed {#limit} characters",
      "any.required": "Name is required",
    }),

  category: Joi.string()
    .custom(objectId, "ObjectId validation")
    .required()
    .messages({
      "any.invalid": "Invalid category ObjectId",
      "any.required": "Category is required",
    }),



  isActive: Joi.boolean().default(true),
});


exports.validateSubCategory = async (req) => {
  try {
    const value = await subCategoryValidation.validateAsync(req.body);
    return {
        name:value.name,
        category:value.category,
      
    }
    
  } catch (error) {
    if(error.data==null){
        throw new customError(401,error)
    }
    else{
      console.log(  "error", error?.details?.map((err) => err.message).join(", "))
    }
    throw new customError(
      401,
      "Category validation error: " +
        error?.details?.map((err) => err.message).join(", ")
    );
  }
};


// module.exports = { subCategoryValidation };
