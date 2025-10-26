// import multer from "multer";
// import path from "path";
// import fs from "fs";
const multer = require('multer');
const path= require('path');



const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp/;
  const valid =
    allowed.test(file.mimetype) || allowed.test(file.originalname.toLowerCase());
  valid
    ? cb(null, true)
    : cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed!"));
};

const upload = multer({ storage, fileFilter });

// export default upload;
module.exports=upload;
