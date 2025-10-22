const Doctor = require('../models/Doctor');
const Blog = require('../models/Blog');
const Appointment = require('../models/Appointment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const cloudinary= require('../db_config/cloudinery');
const fs = require("fs");
// Doctor register
exports.registerDoctor = async (req,res)=>{
  try {
    const { name, email, password,qualification,experience,specialties,bio } = req.body;
    const doctor = new Doctor({ name, email, password,qualification,experience,specialties,bio });
    await doctor.save();
    res.status(201).json({ success:true, message:"Registered successfully, waiting admin verification" ,id:doctor.id});
  } catch(err) {
    res.status(500).json({ success:false, message: err.message });
  }
};

// Doctor login
exports.loginDoctor = async (req,res)=>{
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if(!doctor) return res.status(404).json({ success:false, message:"Doctor not found" });
    if(!doctor.isVerified) return res.status(403).json({ success:false, message:"Doctor not verified by admin" });
    
    const isMatch = await doctor.comparePassword(password);
    if(!isMatch) return res.status(400).json({ success:false, message:"Invalid credentials" });

    const token = jwt.sign({role:"doctor", id: doctor._id }, process.env.JWT_SECRET, { expiresIn:"7d" });
    res.json({ success:true, token, doctor });
  } catch(err){
    res.status(500).json({ success:false, message: err.message });
  }
};
// Get doctor profile
exports.getProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        res.json(doctor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update profile image and specialization
exports.updateProfile = async (req, res) => {
    try {
        const updateData = {
            specialization: req.body.specialization,
        };
        if (req.file) updateData.profileImage = req.file.filename;

        const doctor = await Doctor.findOneAndUpdate({ userId: req.user.id }, updateData, { new: true, upsert: true });
        res.json(doctor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get own appointments
exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.user.id }).populate('doctorId', 'name email');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Doctor blogs CRUD
exports.createBlog = async (req, res) => {
    try {
         const { title, content } = req.body;
    let imageUrl = null;

    if (req.file) {
      // Upload to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploads",
      });

      imageUrl = result.secure_url;

      // Delete local file after upload
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting local file:", err);
      });
    }

    const blog = await Blog.create({
      doctorId: req.user.id,
      title,
      content,
      image: imageUrl,
    });

    res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ doctorId: req.user.id }).populate("doctorId", "name email");
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Get all subscribed doctors (public)
exports.getSubscribedDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Convert page & limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Build search filter
    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },          // case-insensitive name search
            { specialization: { $regex: search, $options: "i" } } // you can add more fields
          ],
        }
      : {};

    // Final query filter (only subscribed doctors)
    const filter = { subscription: true, ...searchFilter };

    // Count total matching documents
    const totalDoctors = await Doctor.countDocuments(filter);

    // Fetch paginated and sorted data
    const doctors = await Doctor.find(filter, { password: 0 })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      success: true,
      total: totalDoctors,
      page: pageNumber,
      totalPages: Math.ceil(totalDoctors / limitNumber),
      count: doctors.length,
      doctors,
    });
  } catch (err) {
    console.error("Error fetching subscribed doctors:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


