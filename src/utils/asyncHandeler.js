exports.asyncHandeler=(fn)=>{
return async(req,res,next)=>{
    try {
        const value=await fn(req,res,next)
        console.log(value)
    } catch (error) {
        next(error)
    }
}
}