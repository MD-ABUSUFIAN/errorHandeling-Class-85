const express=require('express');
const _=express.Router();
const productsController=require('../../controller/products.controller');
const upload = require('../../middleware/multer.middleware');

_.route('/createproducts').post(upload.fields([{name:'image',maxCount:5}]),productsController.createProducts)
_.route('/getallproducts').get(productsController.getAllProducts)
_.route('/getsingleproducts/:slug').get(productsController.getSingleProduct)
_.route('/updateProduct/:slug').put(productsController.updateProduct)
_.route('/updateProductImage/:slug').put(upload.fields([{name:'image',maxCount:5}]),productsController.updateProductImage)


module.exports=_;