require('dotenv').config()

const developmentError=(error,res)=>{
    const statusCode=error.statusCode || 500;
    return res.status(statusCode).json({
        message:error.message || "Internal Server Error",
        status:error.status,
        statusCode:error.statusCode,
        isOperationalError:error.isOperationalError,
        data:error.data,
        errorTrace:error.stack
    })
}
const productionError=(error,res)=>{
    if(error.isOperationalError){
        const statusCode=error.statusCode || 500;
    return res.status(statusCode).json({
        message:error.message || "Internal Server Error",
        status:error.status,
     
    })
    }
    else{
       
    return res.status(statusCode).json({
        message: "Server Error try again",
    })
    }
}

exports.errorHandler=(error,req,res,next)=>{
    // console.error("from global error",error.message);

    if(process.env.NODE_ENV === "development"){
        developmentError(error,res)
    }
    else{
        productionError(error,res)
    }


}