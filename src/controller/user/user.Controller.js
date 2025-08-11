const { customError } = require("../../helpers/customError")
const userModel=require("../../models/user.Model")
const { registrationTemplate } = require("../../template/registrationTemplate")
const crypto = require("crypto")
const { asyncHandeler } = require("../../utils/asyncHandeler")
const  {validateUser}  = require("../../validation/user.validation")
const { mailer } = require("../../helpers/nodemailer")
// const asyncHandeler=require('../../utils/asyncHandeler')
exports.registration=asyncHandeler(async(req,res)=>{

    const value=await validateUser(req,res)
    console.log(value)
    // now save the user data 
    const userData=await new userModel({
        name:value.name,
        email:value.email,
        password:value.password,
    }).save()
    // console.log(userData) 
    // return
    //  verification email 
    const otp=crypto.randomInt(1000,9999)
    const expireTime=Date.now()+10*60*1000
    const flink="www.frontend.com/verify-email?email="+userData.email
 const template=registrationTemplate(userData.name,flink,otp,expireTime)
 await mailer(template,userData.email)
 res.status(201).json({
    userData
 })
})
exports.login=asyncHandeler((req,res)=>{
    throw new Error("login faild")
})

// exports.registration=async(req,res)=>{
//     try {
//         console.log("registration hit from user controller")
//     } catch (error) {
//         console.log("error from use r controller")
//     }
// }