const express=require('express')
const _=express.Router();
const cuponController=require('../../controller/cupon.Controller')





_.route('/createCupon').post(cuponController.createCupon)
_.route('/getAllCupons').get(cuponController.getAllCupons)
_.route('/getSingleCupon/:id').get(cuponController.getSingleCupon)
_.route('/updateCupon/:id').put(cuponController.updateCupon)
_.route('/deleteCupon/:id').delete(cuponController.deleteCupon)




module.exports=_;