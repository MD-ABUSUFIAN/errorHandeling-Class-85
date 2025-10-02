
const { asyncHandeler } = require("../utils/asyncHandeler");
const cartModel = require("../models/cart.Model");
const { customError } = require("../helpers/customError");
const { apiResponse } = require("../utils/apiResponse");
const { validateCart}  = require("../validation/cart.validation")

// create cart
exports.createCart=asyncHandeler(async(req,res)=>{
    const value=await validateCart(req)
    console.log(value)
    return
    const newCart=await cartModel.create(value)
    if(value){
        throw new customError(400,"Cart already exists for this user");
    }
    if(!newCart) {
        throw new customError(500,"Cart not created");
    }
    apiResponse.sendSucess(res, 201, "Cart created successfully",newCart);
})