// const { default: slugify } = require("slugify");

// const subCategoryModel = require("../models/subCategory.Model");
// const { apiResponse } = require("../utils/apiResponse");
// const { asyncHandeler } = require("../utils/asyncHandeler");
// const  {validateSubCategory}  = require("../validation/subCategory.validation");
// const { customError } = require("../helpers/customError");
// const categoryModel = require("../models/category.Model");

// // CREATE SUB CATEGORY 
// exports.createSubCategory=asyncHandeler(async(req,res)=>{
  
//     // validate data 
//     const value=await validateSubCategory(req)
//       console.log(value);
//     // save into database 
//     const subCategory=await subCategoryModel.create({
//         name:value.name,
//         category:value.category,
//     });
//     if(!subCategory){
//         throw new customError(400,"faild to create sub category")
//     }
//     const category=await categoryModel.findById(value?.category);
//     category.subCategory.push(subCategory._id);
//     await category.save();
//     // alternative update subcategory 
//     // const category=await categoryModel.findByIdAndUpdate({_id:value?.category},{$push:{subCategory:subCategory._id}},{new:true});
   
//   apiResponse.sendSucess(res, 201, "Sub Category created successfully",subCategory )
// })

// // get all subcategory
// exports.getAllSubCategory=asyncHandeler(async(req,res)=>{
//     const allsubCategory=await subCategoryModel.find().sort({createdAt:-1}).populate({path:"category"});
//    if(!allsubCategory){
//     throw new customError(401,"Catagory Not Found")
//    }
//    apiResponse.sendSucess(res,200,"All Catagory successfully Find",allsubCategory)
// })

// // get single subcategory 
// exports.singleGetSubCategory=asyncHandeler(async (req,res)=>{
//   const {slug}=req.params
//   if(!slug){
//     throw new customError(401,"slug not found")
//   }
//   const findItem=await subCategoryModel.findOne({slug:slug}).select('-_id -updatedAt -__v');
//   if(!findItem){
//     throw new customError(401,"Sub Category Not Found")
//   }
//   apiResponse.sendSucess(res,200,"Single Sub Category Find Successfully",findItem)
// })
// exports.updateSubCategory=asyncHandeler(async(req,res)=>{
//   const {slug}=req.params;
//   if(!slug){
//     throw new customError(401,"slug not found")
//   }

//   const value=await validateSubCategory(req)
//   const subcategory=await subCategoryModel.findOneAndUpdate({slug:slug},{...req.body},{new:true})


//   subcategory.name=value.name || subcategory.name;
//   if(value.category){
//     // find the category and remove specafic sub category id from category subcategory array
//     const category=await categoryModel.findOne({_id:subcategory.category._id})

//     if(!category){
//       throw new customError(401,"Category Not Found")
//     }
//     const updatedSubCategory=category.subCategory.map((item)=>item.toString()!==subcategory._id.toString())
//     subcategory.category=value.category 
//     category.subCategory=updatedSubCategory;
//     await category.save();

//     await categoryModel.findOneAndUpdate({_id:subcategory.category},{$pull:{subCategory:subcategory._id}},{new:true})
//   }
  
//   subcategory.category=value.category || subcategory.categoryupdateData.category;
 
//   subcategory.slug=slugify(value.name || subcategory.name)
//   await subcategory.save();
//   apiResponse.sendSucess(res,200,"Sub Category Update Successfully",subcategory)
// })

const { default: slugify } = require("slugify");

const subCategoryModel = require("../models/subCategory.Model");
const { apiResponse } = require("../utils/apiResponse");
const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateSubCategory } = require("../validation/subCategory.validation");
const { customError } = require("../helpers/customError");
const categoryModel = require("../models/category.Model");

// CREATE SUB CATEGORY 
exports.createSubCategory = asyncHandeler(async (req, res) => {
  const value = await validateSubCategory(req);

  const subCategory = await subCategoryModel.create({
    name: value.name,
    slug: slugify(value.name),
    category: value.category,
  });

  if (!subCategory) {
    throw new customError(400, "Failed to create sub category");
  }

  // push subcategory id into parent category
  await categoryModel.findByIdAndUpdate(
    value.category,
    { $push: { subCategory: subCategory._id } },
    { new: true }
  );

  apiResponse.sendSucess(res, 201, "Sub Category created successfully", subCategory);
});

// GET ALL SUBCATEGORY
exports.getAllSubCategory = asyncHandeler(async (req, res) => {
  const allsubCategory = await subCategoryModel
    .find()
    .sort({ createdAt: -1 })
    .populate({ path: "category" });

  if (!allsubCategory || allsubCategory.length === 0) {
    throw new customError(404, "No Sub Category Found");
  }

  apiResponse.sendSucess(res, 200, "All Sub Categories found successfully", allsubCategory);
});

// GET SINGLE SUBCATEGORY
exports.singleGetSubCategory = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new customError(400, "Slug not found");
  }

  const findItem = await subCategoryModel
    .findOne({ slug })
    .select("-_id -updatedAt -__v");

  if (!findItem) {
    throw new customError(404, "Sub Category Not Found");
  }

  apiResponse.sendSucess(res, 200, "Single Sub Category found successfully", findItem);
});

// UPDATE SUB CATEGORY
exports.updateSubCategory = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new customError(400, "Slug not found");
  }

  const value = await validateSubCategory(req);

  const subcategory = await subCategoryModel.findOne({ slug });
  if (!subcategory) {
    throw new customError(404, "Sub Category Not Found");
  }

  // Update name + slug
  subcategory.name = value.name || subcategory.name;
  subcategory.slug = slugify(subcategory.name);

  // If category changed → remove from old one and add to new one
  if (value.category && value.category.toString() !== subcategory.category.toString()) {
    // remove from old category
    await categoryModel.findByIdAndUpdate(subcategory.category, {
      $pull: { subCategory: subcategory._id },
    });

    // assign new category
    subcategory.category = value.category;

    // push into new category
    await categoryModel.findByIdAndUpdate(value.category, {
      $push: { subCategory: subcategory._id },
    }, { new: true });
  }

  await subcategory.save();

  apiResponse.sendSucess(res, 200, "Sub Category updated successfully", subcategory);
});

// delete sub category 
exports.deleteSubCategory = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new customError(400, "Slug not found");
  }

  const value = await validateSubCategory(req);

  const subcategory = await subCategoryModel.findOne({ slug });
  if (!subcategory) {
    throw new customError(404, "Sub Category Not Found");
  }
 await categoryModel.findByIdAndUpdate({_id:subcategory.category}, {
      $pull: { subCategory: subcategory._id },
    }, { new: true });


  // If category changed → remove from old one and add to new one
  if (value.category && value.category.toString() !== subcategory.category.toString()) {
    // remove from old category
    await categoryModel.findByIdAndUpdate(subcategory.category, {
      $pull: { subCategory: subcategory._id },
    });

   
  }

  await subcategory.deleteOne({_id:subcategory._id});

  apiResponse.sendSucess(res, 200, "Sub Category updated successfully", subcategory);
});