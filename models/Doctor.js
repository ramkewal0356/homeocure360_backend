// const mongoose = require('mongoose');

// const doctorSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     profileImage: { type: String },
//     specialization: { type: String },
//     subscription: { type: Boolean, default: false },
//     subscriptionPlan: { type: String, enum: ['monthly', 'yearly'], default: null }
// }, { timestamps: true });

// module.exports = mongoose.model('Doctor', doctorSchema);


// models/Doctor.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  qualification:[String],
  experience:String,
  specialties: [String],
   consultationFee: Number,
  slots: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
    },
  ],
  bio: String,
  profileImage: String,
  isVerified: { type: Boolean, default: false },
  subscription: { type: Boolean, default: false },
subscriptionPlan: { type: String, enum: ["monthly", "yearly"], default: null },
subscriptionStart: { type: Date, default: null },
subscriptionEnd: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before save
doctorSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
doctorSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Doctor", doctorSchema);
