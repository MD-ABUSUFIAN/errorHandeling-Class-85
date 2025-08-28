const { default: slugify } = require("slugify");
const { uploadCloudinaryFile, deleteCloudinaryFile } = require("../helpers/cloudinary");
const categoryModel = require("../models/category.Model");
const { apiResponse } = require("../utils/apiResponse");
const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateCategory } = require("../validation/category.validation");
const { customError } = require("../helpers/customError");


exports.createCategory=asyncHandeler(async(req,res)=>{
    const value=await validateCategory(req)
    const imageAssset=await uploadCloudinaryFile(value?.image?.path)

    // save intp database 
    const category=await categoryModel.create({
        name:value.name,
        image:imageAssset,
    });

    if(!category){
        throw new customError(400,"faild to create category")
    }
    
  apiResponse.sendSucess(res, 201, "Category created successfully",category )
})


// get all category
exports.getAllCategory=asyncHandeler(async(req,res)=>{
    // const allCategory=await categoryModel.find({}).populate({
    //     path:"subCategory",
    //     select:"-category -updatedAt"
    // }).sort({createdAt:-1});

    const allCategory=await categoryModel.aggregate([
        {
            $lookup:{
                from:"subcategories",  
                localField:"SubCategory",
                foreignField:"_id",
                as:"subCategoryDetails"
            },
            
                $project:{
                    name:1,
                    image:1,
                    slug:1,
                    isActive:1,
                    createdAt:1,
                    subCategoryDetails:1
                }
            

            
            
        }
        // {
        //     $project:{
        //         "subCategory.category":0,
        //         "subCategory.updatedAt":0,
        //         "subCategory.__v":0
        //     }
        // },
        // {
        //     $sort:{createdAt:-1}
        // }
    ])
   if(!allCategory){
    throw new customError(401,"Catagory Not Found")
   }
   apiResponse.sendSucess(res,200,"All Catagory successfully Find",allCategory)
})

// get single category 
exports.getSingleCategory=asyncHandeler(async(req,res)=>{
    const {slug}=req.params;
    
    if(!slug){
        throw new customError(401,"slug not found")
    }
    const findCategory=await categoryModel.findOne({slug:slug}).select('name image createdAt slug -_id');
    if(!findCategory){
        throw new customError(401,"Category Not Found")
    }
apiResponse.sendSucess(res,200,"Single Category Find Successfully",findCategory)
})

// update category 

exports.updateCategory=asyncHandeler(async(req,res)=>{
    const {slug}=req.params;
    if(!slug){
        throw new customError(401,"slug not found")
    }
    // const value=await validateCategory(req)
   
    const updateData=await categoryModel.findOne({slug:slug})
    if(!updateData){
        throw new customError(401,"Category Not Found")
    }   
      if(req?.body?.name){
        updateData.name=req?.body?.name;
        updateData.slug=slugify(req?.body?.name)
      }
      if(req?.files?.image?.length){

        // delete previus image from cloudinary
         const response=await deleteCloudinaryFile(updateData?.image?.publicId)
            console.log(response)
        const imageAssset=await uploadCloudinaryFile(req?.files?.image[0]?.path)
        updateData.image=imageAssset
      }
   await updateData.save()
   apiResponse.sendSucess(res,200,"Category Update Successfully",updateData)   
})

// delete category
exports.deleteCategory=asyncHandeler(async(req,res)=>{
    const {slug}=req.params;
    if(!slug){
        throw new customError(401,"slug not found")
    }
    const deleteCategory=await categoryModel.findOneAndDelete({slug:slug})
    if(!deleteCategory){
        throw new customError(401,"Category Not Found")
    }
    // delete image from cloudinary
    const response=await deleteCloudinaryFile(deleteCategory?.image?.publicId)
    console.log(response)
    apiResponse.sendSucess(res,200,"Category Delete Successfully",deleteCategory)   
})

// active category 
exports.activeCategory=asyncHandeler(async(req,res)=>{
    const {active}=req.query;
    if(!active){
        throw new customError(401,"active not input")
    }
    const findCategory=await categoryModel.find({isActive:active})
    if(!findCategory){
        throw new customError(401,"Category Not Found")
    }
    apiResponse.sendSucess(res,200,"Active Category Find Successfully",findCategory)
})
   