const express=require('express')
const _=express.Router();
const categoryController=require('../../controller/category.controller')
const upload=require('../../middleware/multer.middleware')

_.route('/create-category').post(upload.fields([{name:'image',maxCount:1}]),categoryController.createCategory)
_.route('/allCategory').get(categoryController.getAllCategory)
_.route('/getSingleCategory/:slug').get(categoryController.getSingleCategory)
_.route('/updateCategory/:slug').put(upload.fields([{name:'image',maxCount:1}]),categoryController.updateCategory)



module.exports=_;