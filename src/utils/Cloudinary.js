import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
    });

const uploadFileCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        //upload file in cloudinary
       const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        fs.unlinkSync(localFilePath) //remove the file in the locally saved as upload uperation got success 
        console.log("file is uploaded on cloudinary successfully",response);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the file in the locally saved as upload uperation got fail
        return null;
    }
}

export {uploadFileCloudinary}