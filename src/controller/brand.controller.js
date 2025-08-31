const { uploadCloudinaryFile } = require("../helpers/cloudinary");
const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateBrand } = require("../validation/brand.validation");
const brandModel = require("../models/brand.Model");
const { customError } = require("../helpers/customError");
const { apiResponse } = require("../utils/apiResponse");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

// create brand 
exports.createBrand=asyncHandeler(async(req,res)=>{
    const value=await validateBrand(req)
    // upload image into cloudinary
    const imageAseet=await uploadCloudinaryFile(value.image.path)
    
    // save the info db here
    const brand= new brandModel({
        name:value.name,
        image:imageAseet
    });
    await brand.save();
    if(!brand){
        throw new customError(500,"faild to create brand")
    }
    apiResponse.sendSucess(
        res,200,"brand created sucessfully",brand
    )
})


// get all brand 
exports.getAllBrand=asyncHandeler(async(req,res)=>{
    const brandList=myCache.get("brands")
    if(brandList==undefined){
 const allBrand=await brandModel.find({}).sort({createdAt:-1})
    myCache.set( "brands", JSON.stringify(allBrand), 1000 );
   if(!allBrand){
    throw new customError(404,"no brand found")
   }
     apiResponse.sendSucess(
        res,200,"all brand get sucessfully",allBrand
    )
    }
     apiResponse.sendSucess(
        res,201,"all brand get sucessfully",JSON.parse(brandList)
    )
  

    })


    // get single brand 
    exports.getsingleBrand=asyncHandeler(async(req,res)=>{
        const {slug}=req.params;
        const findBrand=await brandModel.findOne({slug:slug})
       if(!findBrand){
        throw new customError(404,"no brand found")
       }
       apiResponse.sendSucess(
        res,200,"single brand get sucessfully",findBrand
    )
    })