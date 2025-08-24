const express=require('express')
const _=express.Router();
const subCategoryController=require('../../controller/subCategory.controller')

_.route('/createSubCategory').post(subCategoryController.createSubCategory

)
module.exports=_;