
const { asyncHandeler } = require("../utils/asyncHandeler");

const cuponModel = require("../models/cupon.Model");
const { customError } = require("../helpers/customError");
const { apiResponse } = require("../utils/apiResponse");
const { validateCoupon } = require("../validation/cupon.Validation");

// create cupon
exports.createCupon=asyncHandeler(async(req,res)=>{
    const value=await validateCoupon(req);
    console.log(value);
    return
    const newCupon=await cuponModel.create(value);
    apiResponse(res, 201, true, newCupon, "Cupon created successfully");  

})