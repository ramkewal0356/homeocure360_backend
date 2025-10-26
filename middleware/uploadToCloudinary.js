// import cloudinary from "../config/cloudinary.js";
// import fs from "fs";
const cloudinary = require('../db_config/cloudinery');
const fs= require('fs');

/**
 * Upload file to Cloudinary
 * @param {string} localFilePath - path of the image stored temporarily
 * @param {string} folderName - folder name in Cloudinary
 * @returns {Promise<{ url: string, public_id: string }>}
 */
 const uploadToCloudinary = async (localFilePath, folderName = "uploads") => {
  try {
    if (!localFilePath) throw new Error("File path missing!");

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folderName,
    //   transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    // Remove file from local storage
    fs.unlinkSync(localFilePath);

    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};
module.exports = uploadToCloudinary;
