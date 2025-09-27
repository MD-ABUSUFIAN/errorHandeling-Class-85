const express=require('express')
const _=express.Router();
// const brandController=require('../../controller/brand.controller')
const customerReviewController=require('../../controller/customerReview.controller')
const upload=require('../../middleware/multer.middleware')

_.route('/createReview').post(upload.fields([{name:'image',maxCount:5}]),customerReviewController.createReview)

_.route('/deleteReview').delete(customerReviewController.deleteReview)





module.exports=_;