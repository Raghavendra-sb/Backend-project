// Desc: User controller
import asyncHandler from "../utils/asyncHandler.js";//asyncHandler import kiya

const registerUser = asyncHandler(async (req,res)=>
{
    res.status(200).json(
        {
            message:"ok",
        }
    )
}   
)
export {registerUser}//registerUser export kiya