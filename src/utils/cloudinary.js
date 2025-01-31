import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import dotenv from "dotenv";
import fs from "fs";
import { log } from "console";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadonCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File uploaded on Cloudinary.File src: " + result.url);
    //once the file is uploaded we would like to deletee it from our servers
    fs.unlinkSync(localFilePath);
    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};
const deletefromcloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from Cloudinary.Public Id", publicId);
  } catch (error) {
    console.log("Error deleting fro the cloud", error);
    return null;
  }
};
export { uploadonCloudinary, deletefromcloudinary };
