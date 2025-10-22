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
// Verify a doctor
exports.verifyDoctor = async (req, res) => {
    try {
    //     const { doctorId } = req.params.id;
    //     const doctor = await Doctor.findByIdAndUpdate(doctorId, { isVerified: true }, { new: true });
    //    if(!doctor) return res.status(404).json({ message: "Doctor not found" });
    // res.json({ success: true, doctor });
     const doctor = await Doctor.findById(req.params.id);
    if(!doctor) return res.status(404).json({ success:false, message:"Doctor not found" });
    doctor.isVerified = true;
    await doctor.save();
    res.json({ success:true, message:"Doctor verified successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
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

// See all appointments
exports.getAllAppointments = async (req, res) => {
    const appointments = await Appointment.find().populate('userId', 'name email').populate('doctorId', 'userId');
    res.json(appointments);
};
