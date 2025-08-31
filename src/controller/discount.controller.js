const { customError } = require("../helpers/customError");
const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateDiscount } = require("../validation/discount.validation");
const discountModel=require('../models/discount.Model')
const categoryModel=require('../models/category.Model');
const { apiResponse } = require("../utils/apiResponse");
const NodeCache = require( "node-cache" );
const subCategoryModel = require("../models/subCategory.Model");
const { now } = require("mongoose");
const myCache = new NodeCache();

exports.createDiscount=asyncHandeler(async(req,res)=>{
    const value=await validateDiscount(req)

    if(!value){
        throw new customError(404,"validation error")
    }
    const newDiscount=await discountModel.create(value)
    if(!newDiscount){
        throw new customError(404,"Discount creation failed")
    }
    if(value.category && value.discountPlan=="category"){
        await categoryModel.findByIdAndUpdate(value.category,{
            discount:newDiscount._id},{new:true})
    }
    apiResponse.sendSucess(
        res,201,"Discount created successfully",newDiscount
    )
  
})

exports.getAllDiscount=asyncHandeler(async(req,res)=>{
    const discountList=myCache.get("discounts")
    if(discountList==undefined){
         const allDiscount=await discountModel.find({}).sort({createdAt:-1})
            myCache.set( "discounts", JSON.stringify(allDiscount), 1000 );
    if(!allDiscount){
        throw new customError(404,"No discount found")
    }
    apiResponse.sendSucess(
        res,200,"All discount fetched successfully",allDiscount
    )
    }
    apiResponse.sendSucess(
        res,201,"All discount fetched successfully",JSON.parse(discountList)
    )

 })

 exports.getSingleDiscount=asyncHandeler(async(req,res)=>{
    const {slug}=req.params;
    if(!slug){
        throw new customError(404,"please provide valid slug")
    }
    const findDiscount=await discountModel.findOne({slug:slug}) .populate(["category","subCategory"])
    if(!findDiscount){
        throw new customError(404,"No discount found")
    }
    apiResponse.sendSucess(
        res,200,"Single discount fetched successfully",findDiscount
    )
})


exports.updateDiscount=asyncHandeler(async(req,res)=>{
    const {slug}=req.params;  

    if(!slug){
        throw new customError(404,"please provide valid slug")
    }
    const validateData=await validateDiscount(req)
    if(!validateData){
        throw new customError(404,"validation error")
    }
    const discount=await discountModel.findOne({slug:slug})
    if(!discount){
        throw new customError(404,"No discount found")
    }   

    // update category 
   if(discount.category && discount.discountPlan=="category"){
        await categoryModel.findByIdAndUpdate(discount.category,{
            discount:null},{new:true})
    }

    // update subcategory 
    if(discount.subCategory && discount.discountPlan=="subcategory"){
        await subCategoryModel.findByIdAndUpdate(discount.subCategory,{
            discount:null})
    }
    // now update with new category or subcategory
    if(validateData.category && validateData.discountPlan=="category"){
        await categoryModel.findByIdAndUpdate(validateData.category,{
            discount:discount._id},{new:true})
    }
    // update subcategory 
    if(validateData.subCategory && validateData.discountPlan=="subCategory"){
        await subCategoryModel.findByIdAndUpdate(validateData.subCategory,{
            discount:discount._id})
    }
   const updatedDiscount=await discountModel.findOneAndUpdate({slug:slug},validateData,{new:true})
    apiResponse.sendSucess(
        res,200,"Discount updated successfully",updatedDiscount
    )
  })
  exports.deleteDiscount=asyncHandeler(async(req,res)=>{
    const {slug}=req.params; 
    if(!slug){
        throw new customError(404,"please provide valid slug")
        }
        const discount=await discountModel.findOneAndDelete({slug:slug})
        if(!discount){
            throw new customError(404,"No discount found")
        }
        apiResponse.sendSucess(
            res,200,"Discount deleted successfully",discount
        )
    
    })