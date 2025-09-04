const { uploadCloudinaryFile } = require("../helpers/cloudinary");
const { customError } = require("../helpers/customError");
const productsModel = require("../models/products.Model");
const { apiResponse } = require("../utils/apiResponse");
const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateProduct } = require("../validation/products.validation");

exports.createProducts=asyncHandeler(async(req,res)=>{

    const data=await validateProduct(req)
    const allImages=[]
    // upload images for cloudinary 

     for(const img of req.files.image){
        const imageInfo=await uploadCloudinaryFile(img.path)
        allImages.push(imageInfo)
    }
    
    // NOW SAVE PRODUCT INTO DATABASE
    const product=await productsModel.create({
        ...data,
        image:allImages
    })
    if(!product)throw new customError("Product create failed, try again")
     apiResponse.sendSucess(res,200,"Product created sucessfully",product)
    
})