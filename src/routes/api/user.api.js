const express=require("express");
const _=express.Router();
const userController=require("../../controller/user/user.Controller")


_.route('/registration').post(userController.registration)
_.route('/verify-email').post(userController.verifyEmail)
_.route('/resendOtp').post(userController.resendOtp)
_.route('/forgetPassword').post(userController.forgetPassword)
_.route('/resetPassword').post(userController.resetPassword)
_.route('/login').post(userController.login)
_.route('/logout').post(userController.logOut)
// _.route('/getme').post(userController.getMe)

module.exports=_;