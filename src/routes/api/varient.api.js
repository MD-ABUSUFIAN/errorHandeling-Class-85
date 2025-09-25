const express=require('express')
const _=express.Router();
const varientController=require('../../controller/varient.Controller')
const upload=require('../../middleware/multer.middleware')


_.route('/createVarient').post(upload.fields([{name:'image',maxCount:5}]),varientController.createVarient)
_.route('/getAllVarient').get(varientController.getAllVarient)
_.route('/getsingleVarient/:slug').get(varientController.getSingleVarient)
_.route('/uploadVarientImage/:slug').post(upload.fields([{name:'image',maxCount:5}]),varientController.uploadVarientImage)
_.route('/updateVarient/:slug').put(varientController.updateVarient)



module.exports=_;