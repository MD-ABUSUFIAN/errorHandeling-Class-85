const { uploadCloudinaryFile, deleteCloudinaryFile } = require("../helpers/cloudinary");
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


    // update brand 
    exports.updateBrand=asyncHandeler(async(req,res)=>{
        const {slug}=req.params;
        if(!slug){
            throw new customError(404,"no brand found")
        }
        const value=await validateBrand(req)
        const findBrand=await brandModel.findOne({slug:slug})
      
        // console.log(req?.files?.image[0].path);
        if(!findBrand){
            throw new customError(404,"no brand found")
           }
    
        //    delete image for cloudinary 
        if(req?.files?.image ){
      
             await deleteCloudinaryFile(findBrand?.image?.publicId)
             
        //    update cloudinary for new image 
                const imageAssset=await uploadCloudinaryFile(req?.files?.image[0]?.path)
                findBrand.image=imageAssset
            // const imageAseet=await uploadCloudinaryFile(req?.files?.image[0]?.path)
            // findBrand.image=imageAseet;
        }
              // update brand info
              findBrand.name=value.name || findBrand.name;
              await findBrand.save();
apiResponse.sendSucess(
    res,200,"brand update sucessfully",findBrand
)
 console.log("this is hit");
    })

    // delete brand 
    exports.deleteBrand=asyncHandeler(async(req,res)=>{
        const {slug}=req.params;
        if(!slug){
            throw new customError(404,"no brand found")
        }
        const findData=await brandModel.findOneAndDelete({slug:slug})
        console.log(findData);
       
        if(!findData){
            throw new customError(404,"no brand found")
           }
              // delete image for cloudinary
                await deleteCloudinaryFile(findData?.image?.publicId)        
               
 const brandDelete=await brandModel.findOneAndDelete({slug:slug});
 console.log(brandDelete);
 if(!brandDelete){
    throw new customError(500,"faild to delete brand")
 }
 apiResponse.sendSucess(
    res,200,"brand delete sucessfully",findData
)
                
    
    })