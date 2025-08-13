const { customError } = require("../../helpers/customError")
const userModel=require("../../models/user.Model")
const { registrationTemplate, resendTemplate, resetPasswordTemplate } = require("../../template/registrationTemplate")
const crypto = require("crypto")
const { asyncHandeler } = require("../../utils/asyncHandeler")
const  {validateUser}  = require("../../validation/user.validation")
const { mailer } = require("../../helpers/nodemailer")
const { apiResponse } = require("../../utils/apiResponse")
// const asyncHandeler=require('../../utils/asyncHandeler')
exports.registration=asyncHandeler(async(req,res)=>{

    const value=await validateUser(req)
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
 await mailer("Confirm Registration",template,userData.email)
 userData.resetPasswordOtp=otp;
 userData.resetPasswordExperyDate=expireTime
 await userData.save();
 res.status(201).json({
    userData
 })
})

// verify email 
exports.verifyEmail=asyncHandeler(async(req,res)=>{
const {email,otp}=req.body;
if(!email || !otp){
    throw new customError(401,"email or otp missing")
}
//  find the user using email 
const findUser=await userModel.findOne({
    $and:[{email:email},{resetPasswordOtp:otp},{resetPasswordExperyDate:{$gt:Date.now()}}]})
if(!findUser){
    throw new customError(401,"User Not Found")
}
findUser.isEmailVerified=true;
findUser.resetPasswordOtp=null;
findUser.resetPasswordExperyDate=null;
await findUser.save();
apiResponse.sendSucess(res,200,"email verification successfully",findUser)
})

// resend otp 
exports.resendOtp=asyncHandeler(async(req,res)=>{
  const {email}=req.body
  if(!email){
    throw new customError(401,"email missing")
}
const userData=await userModel.findOne({email:email})
    if(!userData){
        throw new customError(401,"user not found")
    }
const otp=crypto.randomInt(1000,9999)
    const expireTime=Date.now()+10*60*1000
    const flink="www.frontend.com/verify-email?email="+userData.email
 const template=resendTemplate(userData.name,flink,otp,expireTime)
 await mailer("Resend Otp",template,userData.email)
 userData.resetPasswordOtp=otp;
 userData.resetPasswordExperyDate=expireTime
 await userData.save();
 apiResponse.sendSucess(res,200,"resend otp send successfully check your email",{name:userData.name})

})

//forget password
exports.forgetPassword=asyncHandeler(async(req,res)=>{
    const{email}=req.body
      if(!email){
    throw new customError(401,"email missing")
}
const userData=await userModel.findOne({email:email})
    if(!userData){
        throw new customError(401,"user not found")
    }
    const flink="www.frontend.com/verify-email?email="
     const template=resetPasswordTemplate(userData.name,flink)
 await mailer("forget Password",template,userData.email)
//  userData.resetPasswordOtp=otp;
//  userData.resetPasswordExperyDate=expireTime
//  await userData.save();
 apiResponse.sendSucess(res,200,"resend otp send successfully check your email",{name:userData.name})
})

// reset password 
exports.resetPassword=asyncHandeler(async(req,res)=>{
    const {email,newPassword,confirmPassword}=req.body;
    if(!email || !newPassword || !confirmPassword){
        throw new customError(401,"email,newpassword and confirmPassword missing")
    }
    
const regex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)[A-Za-z\d\W]{5,8}$/
if(!regex.test(newPassword)){
 throw new customError(401,"Password must be 5-8 characters long, include at least 1 uppercase letter, 1 lowercase letter, and 1 special character")
}
if(newPassword !==confirmPassword){
        throw new customError(401,"password did not match !!")
    }
    const findUser=await userModel.findOne({email:email})
    console.log(findUser)
   
    if(!findUser){
         throw new customError(401,"user not found !!")
    }
    findUser.password=newPassword;
    await findUser.save()
    apiResponse.sendSucess(res,200,"reset password successfully",findUser)

})

//login

exports.login=asyncHandeler(async(req,res)=>{
    const {email,password}=await validateUser(req)
    const findUser=await userModel.findOne({email})
    if(!findUser){
    
        throw new customError(401,"User Not Found")
    }
   
    const isMatch= await findUser.comparePassword(password)
    console.log(isMatch)
    // return
 
    if(!isMatch){
        throw new customError(401,"password not match")
    }
    // genarate access token access token and refresh token 
    const accessToken=await findUser.acessTokenGenerate()
    const refreshToken=await findUser.refreshTokenGenarate()
    // send refresh token into cookies 
    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"none",
        path:"/",
        maxAge:15*24*60*1000
    })
    // set refresh token into database 
    findUser.refreshToken=refreshToken;
    await findUser.save()
    apiResponse.sendSucess(res,200,"login Successfully",{
        data:{
            name:findUser.name,
            accessToken:accessToken
        }
    })
    
})
































// exports.registration=async(req,res)=>{
//     try {
//         console.log("registration hit from user controller")
//     } catch (error) {
//         console.log("error from use r controller")
//     }
// }