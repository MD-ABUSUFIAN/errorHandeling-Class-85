const { customError } = require('../../helpers/customError');
const userModel = require('../../models/user.Model');
require('dotenv').config()
const jwt=require('jsonwebtoken')
const {
  registrationTemplate,
  resendTemplate,
  resetPasswordTemplate,
} = require('../../template/registrationTemplate');
const crypto = require('crypto');
const { asyncHandeler } = require('../../utils/asyncHandeler');
const { validateUser } = require('../../validation/user.validation');
const { mailer } = require('../../helpers/nodemailer');
const { apiResponse } = require('../../utils/apiResponse');
const { sendSms } = require('../../helpers/sendSms');
// const asyncHandeler=require('../../utils/asyncHandeler')
exports.registration = asyncHandeler(async (req, res) => {
  const value = await validateUser(req);
  console.log(value);
  // now save the user data
  const userData = await new userModel({
    name: value.name,
    email: value.email ||null,
    phone:value.phone ||null,
    password: value.password,
    
  }).save();
  // console.log(userData)
  // return
  
  //  verification email
  const otp = crypto.randomInt(1000, 9999);
  const expireTime = Date.now() + 10 * 60 * 1000;

  if(value.email){
const flink = 'www.frontend.com/verify-email?email=' + userData.email;
  const template = registrationTemplate(userData.name, flink, otp, expireTime);
  await mailer( template, userData.email);
  userData.resetPasswordOtp = otp;
  userData.resetPasswordExperyDate = expireTime;
  }
  
  
  if(value.phone){
const flink = 'www.frontend.com/verify-phone?phone=' + userData.phone;
const smsBody=` your OTP for registration is ${otp} . It will expire in ${expireTime} minutes.Complete your registration here : ${flink}`
await sendSms(userData?.phone,smsBody)

  }

});

// verify email
exports.verifyEmail = asyncHandeler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new customError(401, 'email or otp missing');
  }
  //  find the user using email
  const findUser = await userModel.findOne({
    $and: [
      {$or:[{ email: email },{phone:req.body.phone}]},
      { resetPasswordOtp: otp },
      { resetPasswordExperyDate: { $gt: Date.now() } },
    ],
  });
  if (!findUser) {
    throw new customError(401, 'User Not Found');
  }
  findUser.isEmailVerified = true;
  findUser.resetPasswordOtp = null;
  findUser.resetPasswordExperyDate = null;
  await findUser.save();
  apiResponse.sendSucess(res, 200, 'email verification successfully', findUser);
});

// resend otp
exports.resendOtp = asyncHandeler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new customError(401, 'email missing');
  }
  const userData = await userModel.findOne({ email: email });
  if (!userData) {
    throw new customError(401, 'user not found');
  }
  const otp = crypto.randomInt(1000, 9999);
  const expireTime = Date.now() + 10 * 60 * 1000;
  const flink = 'www.frontend.com/verify-email?email=' + userData.email;
  const template = resendTemplate(userData.name, flink, otp, expireTime);
  await mailer('Resend Otp', template, userData.email);
  userData.resetPasswordOtp = otp;
  userData.resetPasswordExperyDate = expireTime;
  await userData.save();
  apiResponse.sendSucess(
    res,
    200,
    'resend otp send successfully check your email',
    { name: userData.name }
  );
});

//forget password
exports.forgetPassword = asyncHandeler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new customError(401, 'email missing');
  }
  const userData = await userModel.findOne({ email: email });
  if (!userData) {
    throw new customError(401, 'user not found');
  }
  const flink = 'www.frontend.com/verify-email?email=';
  const template = resetPasswordTemplate(userData.name, flink);
  await mailer('forget Password', template, userData.email);
  //  userData.resetPasswordOtp=otp;
  //  userData.resetPasswordExperyDate=expireTime
  //  await userData.save();
  apiResponse.sendSucess(
    res,
    200,
    'resend otp send successfully check your email',
    { name: userData.name }
  );
});

// reset password
exports.resetPassword = asyncHandeler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || !confirmPassword) {
    throw new customError(401, 'email,newpassword and confirmPassword missing');
  }

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)[A-Za-z\d\W]{5,8}$/;
  if (!regex.test(newPassword)) {
    throw new customError(
      401,
      'Password must be 5-8 characters long, include at least 1 uppercase letter, 1 lowercase letter, and 1 special character'
    );
  }
  if (newPassword !== confirmPassword) {
    throw new customError(401, 'password did not match !!');
  }
  const findUser = await userModel.findOne({ email: email });
  console.log(findUser);

  if (!findUser) {
    throw new customError(401, 'user not found !!');
  }
  findUser.password = newPassword;
  await findUser.save();
  apiResponse.sendSucess(res, 200, 'reset password successfully', findUser);
});

//login

exports.login = asyncHandeler(async (req, res) => {
  const { email, password} = await validateUser(req);
  const findUser = await userModel.findOne({ email});
  if (!findUser) {
    throw new customError(401, 'User Not Found');
  }

  const isMatch = await findUser.comparePassword(password);
  console.log(isMatch);
  // return

  if (!isMatch) {
    throw new customError(401, 'password not match');
  }
  // genarate access token access token and refresh token
  const accessToken = await findUser.acessTokenGenerate();
  const refreshToken = await findUser.refreshTokenGenarate();
  // send refresh token into cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV=='development'? false:true,
    sameSite: 'none',
    path: '/',
    maxAge: 15 * 24 * 60 * 1000,
  });
  // set refresh token into database
  findUser.refreshToken = refreshToken;
  await findUser.save();
  apiResponse.sendSucess(res, 200, 'login Successfully', {
    data: {
      name: findUser.name,
      accessToken: accessToken,
    },
  });
});

// exports.registration=async(req,res)=>{
//     try {
//         console.log("registration hit from user controller")
//     } catch (error) {
//         console.log("error from use r controller")
//     }
// }

exports.logOut=asyncHandeler(async(req,res)=>{
  const token=req?.headers?.authorization || req?.body?.accessToken;
  const decoded=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  const client=await userModel.findById(decoded.id)
  console.log(client)
if(!client) throw new customError(401,"user not found")
  //clear the refresh token
client.refreshToken=null
await client.save()

// now clear the cookie from browsar
res.clearCookie('refreshToken',refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV=='development'? false:true,
    sameSite: 'none',
    path: '/',
  })
  // send sms 
  const smsRes=await sendSms('01568111747',`logout successfully MR: ${client.name}`)
  if(smsRes.response_code!==200){
    throw new customError(500,"send sms failed")
  }
  // return res.status(301).redirect('www.frntend.com/logout')
  apiResponse.sendSucess(res,200,"logout successfully",client)
})

// exports.getMe=asyncHandeler(async(req,res)=>{
//   // const findUser=userModel.findOne({accessToken: req?.body?.accessToken})
//   if(!findUser){
//     throw new customError(401,"access token by user not found")
//   }
//   apiResponse.sendSucess(res,201,"successfully find this user access token",findUser)
// })
