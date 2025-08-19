exports.asyncHandeler=(fn)=>{
return async(req,res,next)=>{
    try {
        const value=await fn(req,res) 
        console.log(value)
        return value
       
    } catch (error) {
        next(error)
    }
}
}

// app.post('/user',async(req,res,next)=>{
// try {
    
// } catch (error) {
    
// }
// })