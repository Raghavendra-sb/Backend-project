// Desc: User controller
import asyncHandler from "../utils/asyncHandler.js";//asyncHandler import kiya
import {ApiError} from "../utils/ApiError.js";//ApiError import kiya
import {User} from "../models/user.model.js";//User import kiya
import { uploadFileCloudinary } from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req,res)=>
{
  
        // get the user info from the frontend
        // check for validation (username,email)
        // check if the user already exists
        // check for the images - avatar
        // upload the images in the cloudinary
        // create a user object- create entry in the database
        // remove the password and refresh token from the response
        // check for user creation(wheather response is NULL or not)
        // send the response to the frontend
        //1st step
      const {fullname , email, username, password}= req.body//not for files handling only data
      // console.log("username",username);
     // console.log("req.body",req.body);
      //2nd step for file handling  go for routes/user.routes.js

      //step 3 check for validation
    if(
     [fullname, email, username, password].some((field)=>  field?.trim() === "")
    )
    {
          throw new ApiError(400,"Please fill all the fields");
    }
    //step 4 check if the user already exists
  const existedUser =  await User.findOne({
      $or:[{email},{username}] //or operator is used 
    })

    if(existedUser)
    {
        throw new ApiError(409,"User already exists");
    }
// step 5 check for the images - avatar
   const avatarLocalPath = req.files?.avatar[0]?.path
  // console.log("req.files",req.files);
   ///if files are there then only go for avatar and first property of avatar gives a object then u can go for path
   // by this u will get the proper path of the file uploaded by the multer
   //const coverImageLocalPath = req.files?.cover[0]?.path
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.cover) && req.files.cover.length > 0)
   {coverImageLocalPath = req.files.cover[0].path}

   // step 5 continued
   if(!avatarLocalPath)
   {
        throw new ApiError(400,"Please upload the avatar image");
   }
   // step 6 upload them to cloudinary 
   // uploading on cloudinary will takes time
   const avatar = await uploadFileCloudinary(avatarLocalPath);
   const coverImage = await  uploadFileCloudinary(coverImageLocalPath);
   //confirmation of avator
   if(!avatar)
   {
    throw new ApiError(400,"Cloudinary image upload failed");
   }
  //step 7 create a user object- create entry in the database
    // as only user model is able to interact with the database
    //create is a method which takes a object and create a entry in the database
    //since while interacting with the db it may take time so we use await
    //also we  may come across some error so we use async handler
   const user = await User.create({
       fullname,
       email,
       avatar:avatar.url,
       coverImage:coverImage?.url || "",//if cover image is not there then empty string
       username:username.toLowerCase(),
       password,
    })
// confirmation if the user is created or not as mongodb it self give id to the user entry in the database, if the id is present it means that the user is been created
// if the user is not created then it will return null
    const userCreated = await User.findById(user._id).select("-password -refreshToken")//select is used to remove the password and refresh token from the response
    if(!userCreated)
    {
      throw new ApiError(500,"User creation failed");
    }

    //final step : send the response to the frontend
   return res.status(201).json(
    new ApiResponse(201,userCreated,"User registered successfully")
   )
}   
)
export {registerUser}//registerUser export kiya

