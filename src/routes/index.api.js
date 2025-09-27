const express=require("express");
const _=express.Router();


_.use('/auth',require('./api/user.api'))
_.use('/category',require('./api/category.api'))
_.use('/subcategory',require('./api/subcategory.api'))
_.use('/brand',require('./api/brand.api'))
_.use('/discount',require('./api/discount.api'))
_.use('/products',require('./api/products.api'))
_.use('/varient',require('./api/varient.api'))
_.use('/review',require('./api/customerReview.api'))
_.use('/cupon',require('./api/cupon.api'))
module.exports=_;