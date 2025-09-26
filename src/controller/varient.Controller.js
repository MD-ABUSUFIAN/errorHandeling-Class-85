require('dotenv').config()
const { customError } = require('../helpers/customError');
const varientModel = require('../models/varient.Model');
const productModel = require('../models/products.Model');
const { asyncHandeler } = require('../utils/asyncHandeler');
const {
  uploadCloudinaryFile,
  deleteCloudinaryFile,
} = require('../helpers/cloudinary');
const{ apiResponse }=require('../utils/apiResponse')
const  {validateVariant}  = require('../validation/varient.validation');

// create varient
exports.createVarient=asyncHandeler(async(req,res)=>{
    const data=await validateVariant(req);
   
    //upload image to cloudinary
    const imageUrls=[];

    for(const img of data.images){
        const url=await uploadCloudinaryFile(img.path);
        imageUrls.push(url);
    }

    const varient=await varientModel.create({...data,images:imageUrls});
    apiResponse.sendSucess(res,200,"varient created sucessfully",varient)
    if(!varient){
        throw new customError(401,"faild to create varient")
    }
    // now push the varient id into productModel 
    const checkUpdateProduct=await productModel.findOneAndUpdate({_id:data.productId},{$push:{varients:varient._id}},{new:true})
    if(!checkUpdateProduct){
        throw new customError(401,"varient not push into product")
    }
    apiResponse.sendSucess(res,200,"varient created and push into product sucessfully",varient)

})
// get all varient

exports.getAllVarient=asyncHandeler(async(req,res)=>{
    const varients=await varientModel.find().populate('product')
    .sort({createdAt:-1})
    apiResponse.sendSucess(res,200,"varients fetched successfully",varients)
    if(!varients){
        throw new customError(401,"faild to fetch varients",varients)
    }
})
// get single varient
exports.getSingleVarient=asyncHandeler(async(req,res)=>{
    const {slug}=req.params;
    const varient=await varientModel.findOne(slug).populate('product')
    apiResponse.sendSucess(res,200,"varient fetched successfully",varient)
    if(!varient){
        throw new customError(401,"faild to fetch varient",varient)
    }   })

    // upload varient image 
exports.uploadVarientImage=asyncHandeler(async(req,res)=>{
        const {slug}=req.params;
        const {image}=req.files
        const varient=await varientModel.findOne({slug})
        if(!varient){
            throw new customError(401,"varient not found")
        }
        apiResponse.sendSucess(res,200,"varient fetched successfully",varient)
        // upload image to cloudinary
        const imageUrls=await Promise.all(image.map(async(img)=>{
            uploadCloudinaryFile(img.path)
        }))
            varient.image=[...varient.images,...imageUrls]
            await varient.save()
        apiResponse.sendSucess(res,200,"varient image uploaded successfully",imageUrls) })

        // update varient information 
        exports.updateVarient=asyncHandeler(async(req,res)=>{
            const {slug}=req.params;
            const data=await validateVariant(req);
            const existingVariant=await varientModel.findOne({slug})
            if(!existingVariant){
                throw new customError(401,"varient not found")
                // check if product is changed 
            }
            const productChange=data.product && data.product.toString()!==existingVariant.product.toString()

            
            // update varient information
            const updateVarient=await varientModel.findOneAndUpdate({slug},{...data},{new:true})
            if(!updateVarient){
                throw new customError(401,"faild to update varient")
            }
            if(productChange){
                // remove varient from old product
                await productModel.findOneAndUpdate(existingVariant.product,{$pull:{varients:existingVariant._id}},{new:true})
                // add varient to new product
                await productModel.findOneAndUpdate(updateVarient.product,{$push:{varients:updateVarient._id}},{new:true})
            }
            apiResponse.sendSucess(res,200,"varient updated successfully",updateVarient)
        })

        // varient delete 
        exports.deleteVarient=asyncHandeler(async(req,res)=>{
            const {slug}=req.params;
            const varient=await varientModel.findOneAndDelete({slug})
            if(!varient){
                throw new customError(401,"faild to delete varient")
            }
            // remove varient from product
            await productModel.findOneAndUpdate({_id:varient.product},{$pull:{varients:varient._id}},{new:true})
            apiResponse.sendSucess(res,200,"varient deleted successfully",varient)
        })