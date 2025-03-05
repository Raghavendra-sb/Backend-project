// Desc: User controller
import asyncHandler from "../utils/asyncHandler.js";//asyncHandler import kiya
import {ApiError} from "../utils/ApiError.js";//ApiError import kiya
import {User} from "../models/user.model.js";//User import kiya
import { uploadFileCloudinary } from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose, { mongo } from "mongoose";

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

const refreshAccessToken = asyncHandler(async(req,res)=>{

           const IncommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        //const IncommingRefreshToken  = req.cookie.refreshToken || req.body.refreshToken

         if(!IncommingRefreshToken)
         {
            throw new ApiError(401, "Refresh token must be provided");
          }

       try {
         const decodedToken = jwt.verify(IncommingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
         if(!decodedToken)
         {
           throw new ApiError(401,"Unauthorized request")
         }
 
         const user = await User.findById(decodedToken._id)
 
         if(!user) 
         {
           throw new ApiError(404,"User not found")
         }
 
         if(user.refreshToken !== IncommingRefreshToken)//user.refreshToken is the refresh token stored in the database
         {//incoming refresh token is the refresh token sent by the frontend
           throw new ApiError(401,"Refresh token is expired or invalid")
         }
 
         const {accessToken,newRefreshToken}= generateAccessTokenandRefreshToken(user._id)
 
         const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
 
         const options =
         {
           httpOnly:true,
           secure:true
         }
 
         res.status(200).
         cookie("accessToken",accessToken,options).
         cookie("refreshToken",newRefreshToken,options).
         json(
           new ApiResponse(200,{user:loggedInUser,accessToken,newRefreshToken},"Access token refreshed successfully")
         )
       } catch (error) {
        
         throw new ApiError(401,error?.message || "Invalid refresh token");
       }
})

const changePassword = asyncHandler(async(req,res)=>
{
  const {oldPassword,newPassword} =req.body;//i will check wheter the user is logged in or not in the router file by using the verifyJWT middleware
  const user = await User.findById(req.user?._id)//req.user is the user which is authenticated by the verifyJWT middleware 
  user.isPasswordCorrect(oldPassword);
  if(!isPasswordCorrect)
   {
    throw new ApiError(401,"Old password is incorrect");
   }

   user.password = newPassword;
   await user.save({validateBeforeSave:false})//validate before save is false as we are not validating the password and other fields as we are only updating the password
  
   return res.status(200).json(new ApiResponse(200,{},"Password Updated Successfully"));


  
})

//current user is the user which is authenticated by the verifyJWT middleware
const getCurrentUser = asyncHandler(async(req,res)=>
{
         const user =  await User.findById(req.user?._id).select("-password -refreshToken");
         if(!user)
         {
          throw new res.error(404,"User not found");
         }
         return res.status(200).json(new ApiResponse(200,user," Current User found successfully"));
})

const updateAccountDetails = asyncHandler(async(req,res)=>
{
  const {fullname,email}=req.body;
  if(!fullname || !email)
  {
    throw new ApiError(400,"Please provide fullname and email");
  } 
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        fullname,
        email
      }
    },
    {new:true}
  ).select("-password -refreshToken")

  return res.status(200).json(new ApiResponse(200,user,"Account details updated successfully"));
})

//file update (two middleware are user multer and jwt)

const updateUserAvatar = asyncHandler(async(req,res)=>
{
     const avatarLocalPath = req.file?.path
     if(!avatarLocalPath)
     {
      throw new ApiError(400 , "Avatar is missing")
     }
     const avatar = await uploadFileCloudinary(avatarLocalPath)

     if(!avatar.url)
     {
      throw new ApiError(400,"Avatar upload in Cloudinary Unsuccessful")
     }
     await User.findByIdAndUpdate(req.user?._id
      ,
      {
        $set:{
               avatar:avatar.url
        }
      },
      {
        set:true
      }
     )
     return res.status(200).json(new ApiResponse(200,avatar.url,"Avatar update successful"))


})

const updateUserCoverImage = asyncHandler(async(req,res)=>
  {
       const coverImageLocalPath = req.file?.path
       if(!coverImageLocalPath)
       {
        throw new ApiError(400 , "CoverImage is missing")
       }
       try {
         await fs.unlink(coverImageLocalPath)
       } catch (error) {
        console.error("Error deleting local file:", error); 
       }
       const coverImage = await uploadFileCloudinary(coverImageLocalPath)
  
       if(!coverImage.url)
       {
        throw new ApiError(400,"CoverImage upload in Cloudinary Unsuccessful")
       }
       await User.findByIdAndUpdate(req.user?._id
        ,
        {
          $set:{
                 coverImage:coverImage.url
          }
        },
        {
          set:true
        }
       )
       
       
       return res.status(200).json(new ApiResponse(200,coverImage.url,"CoverImage update successful"))
  
  })

const deleteUser = asyncHandler(async(req,res)=>
{
  await User.findByIdAndDelete(req.user?._id)
  res.status(200).json(new ApiResponse(200,{},"User deleted successfully"))

}
)

const getUserChannelProfile= asyncHandler(async(req,res)=>
{
         const {username} = req.params
         if(!username?.trim())//trim is used to remove the white spaces and gives undefined if the username is empty
         {
          throw new ApiError(400,"Invalid username")
         }
         const channel = await User.aggregate([
          {
            $match:{
              username:username
            },
            //for subscriber count
            $lookup:{
              from:"subscriptions",
              localField:"_id",
              foreignField:"channel",//if channel id is equal to the id of the user then it will be considered as the subscriber.as channel is a entity of the subscription model and the id of the user is stored in the channel field of the subscription model
              as:"subscribers" //as is used to store the result in the subscribers field
            },//now we have the subscribers field in the user model which contains the subscribers of the user 
            //for subscription count
            $lookup:{
              from:"subscriptions",
              localField:"_id",
              foreignField:"subscriber",
              as:"subscriedTo"
            },
            $addFields:{
              subscriberCount: 
              {
                $size:"$subscribers"//count the number of document with same channel id which indirectly gives the number of subscribers
              },
              subscribedToCount:
              {
                $size:"$subscribedTo"
              },
              isSubscribed:
              {
                //  $cond:{
                //     if: {$in :[req.user?._id ,"$subscribers.subscriber"]}
                //  }
                    $cond:
                    {
                      if:{$in : [req.user?._id,"$subscribers.subscriber"]},//the function of in is that it checks if the first argument is present in the second argument or not 
                      //if the user id is present in the subscribers field then it will return true else false

                      then:true,
                      else:false
                    }
              }
            },
            $project:
            {
              username:1,
              fullname:1,
              subscriberCount: 1,
              subscribedToCount:1,
              isSubscribed:1,
              avatar:1,
              coverImage:1,
              email:1

            }
            
          }
         ])


         if(!channel?.length)//the purpose of .length is that if the channel is empty then it will return 0
         {
          throw new ApiError(404,"Channel not found")
         }

         return res.status(200).json(new ApiResponse(200,channel[0],"Channel found Successfully"));
}
)

const getUserWatchHistory = asyncHandler(async(req,res)=>
{
                 const user = await User.aggregate([
                  {
                    $match:
                    {
                      _id:new mongoose.Types.ObjectId(req.user._id)
                    },
                    $lookup:
                    {
                      from:"videos",
                      localField:"watchHistory",
                      foreignField:"_id",
                      as:"watchHistory",
                       
                      pipeline:[
                        {
                          $lookup:
                          {
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",

                            pipeline:[
                              {
                                $project:
                                { fullname:1,
                                  username:1,
                                  avatar:1,
                                }
                              }
                            ]
                          }
                        },
                        {
                          $addFields:
                          {
                            owner:
                            {
                              $first:"owner"
                            }
                          }
                        }
                      ]
                    }
                  }

                ])
                return res.status(200).json( new ApiResponse(200,user[0].watchHistory,"user watch history successfull"))
})


export {registerUser}//registerUser export kiya

export {loginUser}

export {logoutUser}

export {refreshAccessToken}

export {changePassword}

export {getCurrentUser}

export {updateAccountDetails}

export{updateUserAvatar}

export{updateUserCoverImage,
        deleteUser,
        getUserChannelProfile,
        getUserWatchHistory
}