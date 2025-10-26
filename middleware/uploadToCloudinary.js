// import cloudinary from "../config/cloudinary.js";
// import fs from "fs";
const cloudinary = require('../db_config/cloudinery');
// const fs= require('fs');

/**
 * Upload file to Cloudinary
 * @param {string} localFilePath - path of the image stored temporarily
 * @param {string} folderName - folder name in Cloudinary
 * @returns {Promise<{ url: string, public_id: string }>}
 */
//  const uploadToCloudinary = async (localFilePath, folderName = "uploads") => {
//   try {
//     if (!localFilePath) throw new Error("File path missing!");

//     // Upload image to Cloudinary
//     const result = await cloudinary.uploader.upload_stream

//     // Remove file from local storage
//     fs.unlinkSync(localFilePath);

//     return { url: result.secure_url, public_id: result.public_id };
//   } catch (error) {
//     console.error("Cloudinary Upload Error:", error);
//     throw error;
//   }
// };
const uploadToCloudinary = (buffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
module.exports = uploadToCloudinary;
