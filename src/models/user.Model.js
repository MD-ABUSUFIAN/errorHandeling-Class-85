const mongoose=require('mongoose');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const {Schema,Types}=mongoose;
  const bcrypt = require('bcrypt');
const { customError } = require('../helpers/customError');

const userSchema=new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true
    },
    email:{
        type: String,
        // required:true,
        trim:true,
        unique:[true, 'Email Must be Unique']
    },
    password:{
        type: String,
        required:true,
        trim:true
    },
    phone:{
        type: String,
        // required:true,
        trim:true,
    },
    image:{
        type: String,
        trim:true,
    },
    isEmailVerified:Boolean,
    isPhoneVerified:Boolean,
    address:{
        type:String,
        trim:true
    },
    city:{
        type:String,
        trim:true
    },
    state:{
        type:String,
        trim:true
    },
    state:{
        type:String,
        trim:true,
        default:"BANGLADESH"
    },
    zipCode:{
        type:Number,
    },
    dateOfBirth:Date,
    gender:{
        type:String,
        trim:true,
        enum:["male","female","other"]
    },
    lastLogin:Date,
    lastLogout:Date,
    cart:[{
        type:Types.ObjectId,
        ref:"Product"
    }],
    wishList:[{
        type:Types.ObjectId,
        ref:"Product"
    }],
    newsLetterSubscribe:Boolean,
    role:[{
        type:Types.ObjectId,
        ref:"Role"
    }],
    Permission:[{
        type:Types.ObjectId,
        ref:"Permission"
    }],
    resetPasswordOtp:Number,
    resetPasswordExperyDate:Date,
    twoFactorEnabled:Boolean,
    isActive:Boolean,
    refreshToken:{
        type:String,
        trim:true
    }
})

// make a hash password with mongoose Middleware 
userSchema.pre('save',async function(next){
    if(this.isModified('password')){
    //   const saltRounds = 10;
    //   const planPassword=this.password;
       const hashPassword=await bcrypt.hash(this.password,10);
       this.password=hashPassword
    }
})

// check user email and phone number already exist 
userSchema.pre('save',async function(next){
    const isExist=await this.constructor.findOne({email:this.email})
    console.log(isExist)

    if(isExist && isExist._id !== this._id){
        throw new customError(401,'Email or Phone number already exists');
    }
    next()
})

// compare the database encription password and human readable password 
userSchema.method.comparePassword=async function(humanPassword){
    await bcrypt.compare(humanPassword,this.password)
}

// acess token genarate method 
userSchema.method.acessTokenGenerate=async function(){
return await jwt.sign({
  id:this._id,
  email:this.email,
  role:this.role,
  phone:this.phone
}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });

}
//  refresh token genarate method 

userSchema.method.refreshTokenGenarate=async function(){
   return await jwt.sign({
    id:this._id,
}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
}

// varify access token method 
userSchema.method.varifyAcessToken=async function(token){
    return await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}
// varify access token method 
userSchema.method.varifyRefreshToken=async function(token){
    return await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}



module.exports=mongoose.model("user",userSchema)