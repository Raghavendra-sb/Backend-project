
import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"
export const verifyJWT = asyncHandler( async(req,res,next)=>
{
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
        //const token= req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ","")
        //replace("Bearer ","") 
    //is used to remove the bearer from the token and only the token is stored in the token variable
    
    
    //if the token is not present then the user is not authenticated
    
        if(!token)
        {
            throw new ApiError(401,"User is not authenticated")
        }
    
        const decodedToken =jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
       const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user)
        {
             throw new ApiError(404,"Invalid Access token")
        }   
           req.user = user
    
             next()
    } catch (error) {
        throw new ApiError(401,"User is not authenticated")
    }
    
})