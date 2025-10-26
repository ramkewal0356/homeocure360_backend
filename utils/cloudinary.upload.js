// // const fs = require("fs");
// const cloudinary = require("../db_config/cloudinery");

// const uploadSingle = async (filePath, folder = "uploads") => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, { folder });

//     // // Delete local file asynchronously
//     // await fs.unlink(filePath).catch(err =>
//     //   console.error("Failed to delete local file:", err)
//     // );

//     return result.secure_url;
//   } catch (error) {
//     console.error("Cloudinary single upload error:", error);
//     throw error;
//   }
// };
// module.exports= uploadSingle;