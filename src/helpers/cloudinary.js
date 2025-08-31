const { fileURLToPath } = require('url');
const { customError } = require('./customError');
const fs=require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

    cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});

exports.uploadCloudinaryFile=async(filePath)=>{
try {
    if(!filePath || !fs.existsSync(filePath)) {
        throw new customError(401, "image path is missing or file does not exist");
    }
   const response=await cloudinary.uploader.upload(filePath,{
        resource_type: "image", 
        quality: "auto", 
    })
if(response){
    fs.unlinkSync(filePath)
}
    return {publicId:response.public_id,url:response.secure_url}
} catch (error) {
       if(!fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
       }
    throw new customError(500,"faild to upload image"+ error.message)
}
}

// delete image from cloudinary
exports.deleteCloudinaryFile=async(publicId)=>{
    try {
        if(!publicId){
            throw new customError(401,"publicId is missing")
        }
       const response= await cloudinary.uploader.destroy(publicId);
       if(response?.result!=='ok'){
        throw new customError(400,"faild to delete image")
       }
       return response;
    } catch (error) {
   

        throw new customError(500,"faild to delete image"+ error.message)
    }
}