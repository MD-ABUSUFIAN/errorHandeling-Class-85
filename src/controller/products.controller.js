const { uploadCloudinaryFile } = require("../helpers/cloudinary");
require("dotenv").config()
const { customError } = require("../helpers/customError");
const { generateQRCode, generateBarCode } = require("../helpers/qrCode");
const productsModel = require("../models/products.Model");
const { apiResponse } = require("../utils/apiResponse");
const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateProduct } = require("../validation/products.validation");


exports.createProducts=asyncHandeler(async(req,res)=>{
    const barCode=await generateBarCode('hello')
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
        // create QR code for the product
        const link=`${process.env.FRONTEND_URL}/products/`+product.slug;
           const qrCode=await generateQRCode(link)

        //    create bar code for the product 


     apiResponse.sendSucess(res,200,"Product created sucessfully",product)
    
})