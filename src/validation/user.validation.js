const Joi = require('joi');
const {customError} = require('../../src/helpers/customError')
const userValidationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(5)
    .max(20)
    // .pattern(/^[a-zA-Z\s]+$/)
    // .required()
  .messages({
  'string.base': 'Name must be in text format',
  'string.empty': 'Name cannot be empty',
  'string.min': 'Name must be at least 5 characters long',
  'string.max': 'Name cannot be more than 20 characters',
  'string.trim': 'Space are not Allow',
  // 'string.pattern.base': 'Name can only contain letters and spaces',
  'any.required': 'Name is required',
}),
  email: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .message({
      'string.email': 'Your Email must be String',
      'string.pattern.base': 'Your Email not Match the required format',
      'string.trim': 'Space are not Allow',
    }),
    phone: Joi.string()
  .empty()
  .pattern(/^(?:\+?88)?01[3-9]\d{8}$/) // ✅ Bangladesh phone number regex fixed
  .messages({
    'string.base': '📞 Phone number must be in text format',
    'string.empty': '⚠️ Phone number cannot be empty',
    // 'string.trim': '🚫 Phone number cannot have leading or trailing spaces',
    'string.pattern.base':
      '❌ Enter a valid Bangladeshi phone number (e.g. 017XXXXXXXX or +88017XXXXXXXX)',
  }),

password: Joi.string()
  .trim()
  .empty()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)[A-Za-z\d\W]{5,8}$/) // ✅ Password regex OK
  .required()
  .messages({
    'string.base': '🔑 Password must be in text format',
    'string.empty': '⚠️ Password cannot be empty',
    'string.trim': '🚫 Password cannot have leading or trailing spaces',
    'string.pattern.base':
      '❌ Password must be 5-8 characters long, include at least 1 uppercase letter, 1 lowercase letter, and 1 special character',
    'any.required': '📌 Password is required',
  })
  
},{abortEarly: true}).unknown(true);


const validateUser=async(req)=>{
  try {
    const value=await userValidationSchema.validateAsync(req.body)
    // console.log(value)
    return value
    
  } catch (error) {
    // console.log(error)
   throw new customError(401,"user validation error" + error.details.map((erro)=>erro.message))
    
  }
}
module.exports={validateUser}