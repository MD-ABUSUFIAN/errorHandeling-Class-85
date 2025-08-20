const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateCategory } = require("../validation/category.validation");


exports.createCategory=asyncHandeler(async(req,res)=>{
    const value=await validateCategory(req)
    consoel.log(value)
  
})