const Doctor = require('../models/Doctor');
const Blog = require('../models/Blog');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Admin = require("../models/Admin");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// admin setup/login & verify

exports.registerSetup= async(req,res)=>{
    try{
         const email = process.env.ADMIN_EMAIL || 'admin@example.com'; 
         const pass = process.env.ADMIN_PASS || 'admin123'; 
         let admin = await Admin.findOne({email}); 
         if(admin) return res.json({message:'admin exists'}); 
         const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(pass, salt);
           admin = new Admin({email, password: hash, name:'Admin'}); 
           await admin.save();
            res.json({message:'admin created', email});
 }catch(e)
 {
     console.error(e); 
    res.status(500).json({error:'err'}); }
}
// app.post('/api/admin/login',
//      async (req,res)=>{ const {email,password} = req.body;
//       const a = await Admin.findOne({email}); 
//       if(!a) return res.status(401).json({error:'Invalid'}); 
//       const ok = await bcrypt.compare(password, a.password); 
//       if(!ok) return res.status(401).json({error:'Invalid'});
//        const token = genToken({role:'admin', id:a._id, email:a.email});
//         res.json({token, admin:{email:a.email,name:a.name}}); });

exports.loginAdmin = async (req,res)=>{
  try{
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if(!admin) return res.status(404).json({ success:false, message:"Admin not found" });
    // if(password !== admin.password) return res.status(400).json({ success:false, message:"Invalid password" });
 const ok = await bcrypt.compare(password, admin.password); 
      if(!ok) return res.status(401).json({error:'Invalid'});
    const token = jwt.sign({role:'admin', id: admin._id }, process.env.JWT_SECRET, { expiresIn:"7d" });
    res.json({ success:true, token, admin });
  }catch(err){
    res.status(500).json({ success:false, message: err.message });
  }
};


exports.getDashboardStats = async (req, res) => {
  try {
    // Doctors
    const totalDoctors = await Doctor.countDocuments();
    const verifiedDoctors = await Doctor.countDocuments({ isVerified: true });
    const pendingDoctors = await Doctor.countDocuments({ isVerified: false });
    const subscribedDoctors = await Doctor.countDocuments({ subscription: true });

    // Appointments
    const totalAppointments = await Appointment.countDocuments();

    // Revenue (only completed appointments)
    const revenueAgg = await Appointment.aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$fee" },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    res.json({
      success: true,
      doctors: {
        totalDoctors,
        verifiedDoctors,
        pendingDoctors,
        subscribedDoctors,
      },
      appointments: {
        totalAppointments,
      },
      revenue: totalRevenue,
    });
  } catch (err) {
    console.error("Doctor stats error:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.getRecentAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("doctorId", "name")
      // .populate("userId", "name")
      .select("date status patientName doctorId");

    const formatted = appointments.map((a) => ({
      _id: a._id,
      patientName: a.patientName || a.userId?.name || "N/A",
      doctorName: a.doctorId?.name || "N/A",
      date: a.date,
      status: a.status,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error("Recent appointments error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Get all doctors (with pagination & filter)
exports.getAllDoctorsForAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      verified,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // 🔍 Search filter
    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // ✅ Verified / Unverified filter
    if (verified === "true") filter.isVerified = true;
    if (verified === "false") filter.isVerified = false;

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Doctor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err) {
    console.error("Admin doctor list error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// ADMIN: Verify doctor
exports.verifyDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
const {isVerified}=req.body
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { isVerified: isVerified },
      { new: true }
    ).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      message: "Doctor verified successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Manage users, doctors, blogs
exports.getAllDoctors = async (req, res) => {
    const doctors = await Doctor.find().populate( 'name email');
    res.json(doctors);
};

exports.getAllUsers = async (req, res) => {
    const users = await User.find({ role: 'user' });
    res.json(users);
};

exports.getAllBlogs = async (req, res) => {
    const blogs = await Blog.find().populate('doctorId', 'userId');
    res.json(blogs);
};
// ADMIN: Get all blogs
exports.getAllBlogsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const filter = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const blogs = await Blog.find(filter)
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ADMIN: Delete blog
exports.deleteBlogAdmin = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.blogId);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// See all appointments
exports.getAllAppointments = async (req, res) => {
    const appointments = await Appointment.find().populate('userId', 'name email').populate('doctorId', 'userId');
    res.json(appointments);
};
