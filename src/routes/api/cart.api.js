const express=require('express')
const _=express.Router();
const cartController=require('../../controller/cart.Controller')
// const upload=require('../../middleware/multer.middleware')

 _.route('/addToCart').post(cartController.createCart)




module.exports=_;