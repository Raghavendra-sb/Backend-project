//require('dotenv').config({path:'./env'})
import dotenv from "dotenv"

import connectDB from "./db/index.js";  // 👈 Add filename explicitly
import app from "./app.js";
dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
   app.listen(process.env.PORT || 8000 ,()=>{
    console.log(`Server running on the port ${process.env.PORT}`);
    app.on("error",(error)=>{
        console.log("Error:",error);
        throw error; 
    })
   })
})
.catch((error)=>{
 console.error(`Mongo db connection failed :${error}`)
})







//first method
//use IFEE  make async arrow funtion , add try catch block 
// in catch write error
//in try it gives mongoose.connect which takes URL give it 
// and also the database name for the connect
//add error listenerts to listen for errors




// import express from "express";


// const app = express();
// ;(async()=>{
//     try{
//    await mongoose.connect(`${process.env.MONGODB_URI }/${DB_NAME}`)
//   erorr(listeners) app.on("error",(error)=>{
//     console.log("error",error);
//     throw error
//    })
//    app.listen(process.env.PORT,()=>
// {
//     console.log(`App is listening on the port ${PORT}`)
// })
//     }
//     catch(error){
//        console.error("ERROR:",error)
//        throw error
//     }
// })()