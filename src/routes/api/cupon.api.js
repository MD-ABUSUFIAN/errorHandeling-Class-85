const express=require('express')
const _=express.Router();
const cuponController=require('../../controller/cupon.Controller')





_.route('/createCupon').post(cuponController.createCupon)




module.exports=_;