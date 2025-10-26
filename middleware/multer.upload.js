// import multer from "multer";
// import path from "path";
// import fs from "fs";
const multer = require('multer');
const path= require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp/;
  const isValid =
    allowed.test(path.extname(file.originalname).toLowerCase()) &&
    allowed.test(file.mimetype);

  if (isValid) cb(null, true);
  else cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed!"));
};

const upload = multer({ storage, fileFilter });

// export default upload;
module.exports=upload;
