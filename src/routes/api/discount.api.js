
const express=require('express');
const upload = require('../../middleware/multer.middleware');
const discountController=require('../../controller/discount.controller')
const _=express.Router()

_.route('/createDiscount').post(upload.fields([{name:'image',maxCount:1}]),discountController.createDiscount)
_.route('/getAllDiscount').get(discountController.getAllDiscount)

_.route('/getsingleDiscount/:slug').get(discountController.getSingleDiscount)
_.route('/updateDiscount/:slug').put(upload.fields([{name:'image',maxCount:1}]),discountController.updateDiscount)
_.route('/deleteDiscount/:slug').delete(discountController.deleteDiscount)

module.exports=_;