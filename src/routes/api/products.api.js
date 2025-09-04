const express=require('express');
const _=express.Router();
const productsController=require('../../controller/products.controller');
const upload = require('../../middleware/multer.middleware');

_.route('/createproducts').post(upload.fields([{name:'image',maxCount:5}]),productsController.createProducts)


module.exports=_;