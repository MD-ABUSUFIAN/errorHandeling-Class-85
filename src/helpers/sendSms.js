const axios=require('axios')
require('dotenv').config()
const { customError } = require('./customError')
exports.sendSms=async(number,message)=>{
try {
    const response=await axios.post(process.env.BULKSMS_API,{
        api_key:process.env.API_KEY,
        senderid : process.env.SENDERID,
        number:Array.isArray(number)?number.join(','):number,
        message:message
    })
    return response.data
    // console.log("send sms",response);
    
} catch (error) {
    throw new customError(501,"Error occured from send SMS",error)
}
}