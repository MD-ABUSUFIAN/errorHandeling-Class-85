require("dotenv").config()
const mongoose=require("mongoose")


exports.connectDatabase=async()=>{
try {
    const dbInfo= await mongoose.connect(`${process.env.MONGODB_URL}`)
    console.log(`databse connection succecsful ${dbInfo.connection.host}`)
} catch (error) {
    console.log("database connection faild",error)
}
}