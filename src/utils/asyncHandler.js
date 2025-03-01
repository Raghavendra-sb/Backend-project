// const asyncHandler =(fn)=>async(req,res,next)=>{
//      try {
//         await fn(req,res,next)
//      } catch (error) {
//         res.status(error.code || 500).json({
//             sucess:false,
//             message:error.message
//         })
//      }
// }
//The asyncHandler function is a higher-order function (a function that takes another function as an argument and returns a new function).
const asyncHandler =(requestHandler)=>{
  
    return (req,res,next) =>{
   Promise.resolve(
    requestHandler(req,res,next)
   ).catch((err)=>next(err))
    }
}

export  default asyncHandler;