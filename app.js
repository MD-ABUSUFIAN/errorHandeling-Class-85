const globalErrorHandeler=require("./src/helpers/globalErrorHandeler")
const express=require("express");
const cors=require("cors")
// const { trusted } = require("mongoose");
const cookieParser = require('cookie-parser')
const app=express()
//all global middleWare 
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors())

// routes 

app.use("/api/v1",require("./src/routes/index.api"))

// global error handeling middleware 
app.use(globalErrorHandeler.errorHandler)

module.exports={app}