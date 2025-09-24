const express=require('express')
const _=express.Router();
const varientController=require('../../controller/varient.Controller')
const upload=require('../../middleware/multer.middleware')


_.route('/createVarient').post(upload.fields([{name:'image',maxCount:5}]),varientController.createVarient)




module.exports=_;