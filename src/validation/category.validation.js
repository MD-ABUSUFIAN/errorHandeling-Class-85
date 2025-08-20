const Joi = require("joi");
const { customError } = require("../../src/helpers/customError");

const categoryValidationSchema = Joi.object(
  {
    name: Joi.string()
      .trim()
      .min(5)
      .max(20)
      .required()
      .messages({
        "string.base": "Name must be in text format",
        "string.min": "Name must be at least 5 characters long",
        "string.max": "Name cannot be more than 20 characters",
        "string.trim": "Spaces are not allowed",
        "any.required": "Name is required",
      }),
  },
  { abortEarly: true }
).unknown(true);

exports.validateCategory = async (req) => {


  try {
    const value = await categoryValidationSchema.validateAsync(req.body);
    const image=req?.files?.image[0]
    const allowFormat=["image/jpg","image/jpeg","image/png","image/webp"]
  if(image.length>1){
    throw new customError(401,"Image must be single")
  }
  if(image.size>20000){
 throw new customError(401,"Image MAX size 2MB")
  }
  if(!allowFormat.includes(image?.mimetype)){
    throw new customError(401,"Image format not Accepted try image/jpg,png")
  }
    // sanitize image 
    return value;
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


