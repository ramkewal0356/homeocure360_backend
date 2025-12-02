// import mongoose from "mongoose";
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String }, // optional now
    message: { type: String, required: true },
  },
  { timestamps: true }
);

// export default mongoose.model("Contact", contactSchema);
module.exports = mongoose.model('Contact',contactSchema);
