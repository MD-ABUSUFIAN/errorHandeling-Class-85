
const { asyncHandeler } = require("../utils/asyncHandeler");

const cuponModel = require("../models/cupon.Model");
const { customError } = require("../helpers/customError");
const { apiResponse } = require("../utils/apiResponse");
const { validateCoupon } = require("../validation/cupon.Validation");

// create cupon
exports.createCupon=asyncHandeler(async(req,res)=>{
    const value=await validateCoupon(req);
    const newCupon=await cuponModel.create(value);
    if(!newCupon) {
        throw new customError("Cupon not created",500);
    }
    apiResponse.sendSucess(res, 201, "Cupon created successfully",newCupon);  

})

// get all cupons
exports.getAllCupons=asyncHandeler(async(req,res)=>{
    const cupons=await cuponModel.find()
    if(!cupons) {
        throw new customError("Cupons not found",404);
    }
    apiResponse.sendSucess(res, 200, "Cupons fetched successfully",cupons);
})
// get single cupon 
exports.getSingleCupon=asyncHandeler(async(req,res)=>{
     const{id}=req.params;
    const cupon=await cuponModel.findOne({_id:id});
    if(!cupon) {
        throw new customError("Cupon not found",404);
    }
    apiResponse.sendSucess(res, 200, "Cupon fetched successfully",cupon);   
})

// update cupon
exports.updateCupon=asyncHandeler(async(req,res)=>{
    const{id}=req.params;
    const updatedCupon=await cuponModel.findOneAndUpdate({_id:id},{...req.body},{new:true});
    if(!updatedCupon) {
        throw new customError(500,"Cupon not updated");
    }
    apiResponse.sendSucess(res, 200, "Cupon updated successfully",updatedCupon);
})

// delete cupon 
exports.deleteCupon=asyncHandeler(async(req,res)=>{
    const{id}=req.params;
    const deletedCupon=await cuponModel.findOneAndDelete({_id:id});
    if(!deletedCupon) {
        throw new customError(500,"Cupon not deleted");
    }
    apiResponse.sendSucess(res, 200, "Cupon deleted successfully",deletedCupon)
})