const { default: slugify } = require("slugify");

const subCategoryModel = require("../models/subCategory.Model");
const { apiResponse } = require("../utils/apiResponse");
const { asyncHandeler } = require("../utils/asyncHandeler");
const  {validateSubCategory}  = require("../validation/subCategory.validation");
const { customError } = require("../helpers/customError");

// CREATE SUB CATEGORY 
exports.createSubCategory=asyncHandeler(async(req,res)=>{
  
    // validate data 
    const value=await validateSubCategory(req)
      console.log(value);
    // save into database 
    const subCategory=await subCategoryModel.create({
        name:value.name,
        category:value.category,
    });
    if(!subCategory){
        throw new customError(400,"faild to create sub category")
    }
    
  apiResponse.sendSucess(res, 201, "Sub Category created successfully",subCategory )
})