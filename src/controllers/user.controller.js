// Desc: User controller
import asyncHandler from "../utils/asyncHandler.js";//asyncHandler import kiya
import {ApiError} from "../utils/ApiError.js";//ApiError import kiya
import {User} from "../models/user.model.js";//User import kiya
import { uploadFileCloudinary } from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenandRefreshToken = async(userId)=>
{ //only the refresh token is stored in the database and the access token and refresh  is sent to the frontend
  const user = await User.findById(userId) //find the user by the id given during the login
  if(!user)
  {
    throw new ApiError(404,"User not found")    
  }
 const accessToken =  user.generateAccessToken()//generate access token is a method in the user model which generates the access token for the user 
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken,//refresh token is stored in the database for the user 
  await user.save({ValidateBeforeSave:false})//validate before save is false as we are not validating the password and other fields as we are only updating the refresh token
  return {accessToken,refreshToken}//returning the access token and refresh token
}


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



const loginUser = asyncHandler(async (req,res)=>{
          //req body -> data
  //username or email based checking
  //find the user
  //check for the password
  //access and refresh token generation
  //send cookies to the frontend
  const {username, email, password}=req.body

  if(!(username || email))
  {
    throw new ApiError(400,"Please provide username or email")  
  }

  const user =await User.findOne(   //find one is a method which takes a object and find the user
      {
        $or:[{username},{email}]   //querying the database for the user using the or operator of mongodb
      }  //as db is another in another continent so await is used and the user is stored in the user variable
  )

  if(!user)
  {
    throw new ApiError(404,"User not found");
  }

  const isPasswordVaild =await user.isPasswordCorrect(password)//imp : user is the instance of the user model
  //User is the mongoose model
  //here we are using the instance method of the user model and passing the password given during the login
  //in the is PasswordCorrect method it chekcks the password given during the login and the password stored in the database
  //if the password is correct then it will return true else false
  if(!isPasswordVaild)
  {
    throw new ApiError(401,"Password is incorrect");
  }

  const {accessToken,refreshToken}=await generateAccessTokenandRefreshToken(user._id)//getting access token and refresh token through id and destructuring it to store in the variables

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")//select is used to remove the password and refresh token from the response
   
  const options =
  {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only secure in production (HTTPS)
    sameSite: "strict", // Prevent CSRF
  }

  res.status(200).
  cookie("accessToken",accessToken,options).//(key,value,options)
  cookie("refreshToken",refreshToken,options).//refresh token is stored in the cookie
  json(
    new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully")
  )
}
)

const logoutUser= asyncHandler(async(req,res)=>
{
        await User.findByIdAndUpdate(req.user._id, //req.user is the user which is authenticated by the verifyJWT middleware 
           {
            $set:{
                refreshToken:""//refresh token is set to empty string
            }
           },
           {
            new:true//new is true as we want the updated user
           }
        )

        const options =
        {
          httpOnly:true,
          secure:true,
        }

       return res.status(200).
       clearCookie("accessToken",options). 
        clearCookie("refreshToken",options).
        json(
          new ApiResponse(200,{},"User logged out successfully")
        )
})

// const refreshAccessToken = asyncHandler(async(req,res)=>{
//          const IncommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

//          if(!IncommingRefreshToken)
//          {
//          throw new ApiError(401,"Unauthorized request")
//          }

//         const decodedToken = jwt.verify(IncommingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
//})

export {registerUser}//registerUser export kiya

export {loginUser}

export {logoutUser}