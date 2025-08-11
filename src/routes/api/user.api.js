const express=require("express");
const _=express.Router();
const userController=require("../../controller/user/user.Controller")


_.route('/registration').post(userController.registration)
_.route('/login').post(userController.login)

module.exports=_;