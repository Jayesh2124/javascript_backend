import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

        
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret:  process.env.CLOUDINARY_API_SECRET

});

const uploadOnCloud = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        // upload file fon cloud
        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type : "auto"
            })
            // File is uploaded successful
            console.log("File is added Successfully", response.url);
            return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)                //remove the temp locally saved Failed
        return null;
    }
}