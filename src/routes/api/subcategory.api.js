const express=require('express')
const _=express.Router();
const subCategoryController=require('../../controller/subCategory.controller')

_.route('/createSubCategory').post(subCategoryController.createSubCategory

)
_.route('/getAllSubCategory/:slug').get(subCategoryController.getAllSubCategory)
_.route('/singleGetSubCategory/:slug').get(subCategoryController.singleGetSubCategory)
_.route('/updateSubCategory/:slug').put(subCategoryController.updateSubCategory)
module.exports=_;