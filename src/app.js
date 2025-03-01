import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"; 

const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,//settings for cors origin kon kon sa orgina allow karega 
    credentials:true//settings for cors credentials
}))

//data can be sent in any format so we need to parse it
app.use(express.json({//configuring express to accept json data
    limit:"17kb"  //json limit inorder to prevent server from crashing
}))
//multer is used to upload files to server disscussed in another part
app.use(express.urlencoded({extended:true,limit:"17kb"}))//data cmg from URL 
app.use(express.static("public"))//data can be accessed from public (folder pdf,images) etc
app.use(cookieParser())//server sae browser ka cookie read karne k liye aur set karne k liye
// //router import
import userRouter from "./routes/user.route.js"

//routes declaration
// /api/v1 is used to describe the version of the api
app.use("/api/v1/users",userRouter)//userRouter is imported from user.route.js
//app.get is not been used here because we are using router here as separate file so middleware is used here
// here /users will become prefix for all the routes in userRouter
//ex http://localhost:5000/api/v1/users/register
//ex http://localhost:5000/users/login
export default app;