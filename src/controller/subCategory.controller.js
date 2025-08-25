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

// get all subcategory
exports.getAllSubCategory=asyncHandeler(async(req,res)=>{
    const allsubCategory=await subCategoryModel.find().sort({createdAt:-1}).populate({path:"category"});
   if(!allsubCategory){
    throw new customError(401,"Catagory Not Found")
   }
   apiResponse.sendSucess(res,200,"All Catagory successfully Find",allsubCategory)
})

// get single subcategory 
exports.singleGetSubCategory=asyncHandeler(async (req,res)=>{
  const {slug}=req.params
  if(!slug){
    throw new customError(401,"slug not found")
  }
  const findItem=await subCategoryModel.findOne({slug:slug}).select('-_id -updatedAt -__v');
  if(!findItem){
    throw new customError(401,"Sub Category Not Found")
  }
  apiResponse.sendSucess(res,200,"Single Sub Category Find Successfully",findItem)
})
exports.updateSubCategory=asyncHandeler(async(req,res)=>{
  const {slug}=req.params;
  if(!slug){
    throw new customError(401,"slug not found")
  }
  const value=await validateSubCategory(req)
  const updateData=await subCategoryModel.findOneAndUpdate({slug:slug},{...req.body},{new:true})
  if(!updateData){
    throw new customError(401,"Sub Category Not Found")
  }
  updateData.name=value.name || updateData.name;
  // updateData.category=value.category || updateData.category;
  updateData.slug=slugify(value.name || updateData.name)
  await updateData.save();
  apiResponse.sendSucess(res,200,"Sub Category Update Successfully",updateData)
})