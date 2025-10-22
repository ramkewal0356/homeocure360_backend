const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../db_config/cloudinery");

const storage = new CloudinaryStorage({
  cloudinary:cloudinary,
  params: {
    folder: "uploads", 
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage:storage });

module.exports = upload;
