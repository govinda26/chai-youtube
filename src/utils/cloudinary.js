import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

//path = path.resolve(current working directory + .env)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file has been uploaded successfully
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteOnCloudinary = async (oldPublicId) => {
  try {
    if (!oldPublicId) return null;

    //delete file from cloudinary
    const response = await cloudinary.uploader.destroy(oldPublicId, {
      resource_type: "image",
    });
    return response;
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
