import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (filePath) => {
    try{

        // if there is no link come from frontend then return null
        if(!filePath)return null;

        // file have benn uploaded successfully
        const response = await cloudinary.uploader.upload(filePath,{
            resource_type:"auto"
        });
        fs.unlinkSync(filePath);
        // console.log("File has been uploaded successfully", response.url);
        return response;

    }catch(error){
        fs.unlinkSync(filePath);
        // We first temporary store file on our server and then we upload on clodinary
        // and after completed we delete file from our server
    }
}


cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });

export {uploadOnCloudinary};