// import mongoose  from "mongoose";
// import { DB_NAME } from "../constants.js";

// const connectDB= async()=>
// {
//     try {                      //mongoose gives a return object which is connection instance is successful
//        const connectionInstance = await (start here) mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//        console.log(`Connection MongoDB done : DB HOST , ${connectionInstance.connection.host}`)
        
//     } catch (error) {
//         console.error(`Error connecting mongosDB ${error}`);
//         process.exit(1);
//     }
// }

// export default connectDB;
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"; 

const connectDB = async () => {
    try {
        const mongoURI = `${process.env.MONGODB_URI}/${DB_NAME}`;
        console.log(`Attempting to connect with URI: ${mongoURI}`); // Debug line
        const connectionInstance = await mongoose.connect(mongoURI);
        console.log(`Connection to MongoDB successful! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1);
    }
};

export default connectDB;