require('dotenv').config()
const { customError } = require('../helpers/customError');
const varientModel = require('../models/varient.Model');
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
    console.log(data)

    //upload image to cloudinary
    const imageUrls=[];

    for(const img of data.images){
        const url=await uploadCloudinaryFile(img);
        imageUrls.push(url);
    }

    const varient=await varientModel.create({...data,images:imageUrls});
    apiResponse.sendSucess(res,200,"varient created sucessfully",varient)
    if(!varient){
        throw new customError(500,"faild to create varient")
    }

})