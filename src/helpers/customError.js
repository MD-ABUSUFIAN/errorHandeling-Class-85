class customError extends Error{
    constructor(statusCode,message){
        super( message)
        this.status = statusCode >= 400 && statusCode<500 ? "Client Error":"Server Error",
        this.statusCode=statusCode || 500,
        this.message=message || "Something went wrong",
        this.isOperationalError=statusCode >= 400 && statusCode<500 ? false:true,
        this.data=null,
        this.stack
    }
}

module.exports={customError}