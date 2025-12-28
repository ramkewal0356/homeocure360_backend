const Doctor = require('../models/Doctor');
const Blog = require('../models/Blog');
const Appointment = require('../models/Appointment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const jwt = require("jsonwebtoken");

const uploadToCloudinary = require('../middleware/uploadToCloudinary');
// Doctor register
exports.registerDoctor = async (req,res)=>{
  try {
    const { name, email,phone, password,qualification,experience, consultationFee,specialties,bio } = req.body;
    const doctor = new Doctor({ name, email, phone,password,qualification,experience,consultationFee,specialties,bio });
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
        const doctor = await Doctor.findById(req.user.id).select("-password");

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.json(doctor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Get public doctor details (for website / app users)
exports.getDoctorDetailsPublic = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId).select(
      "name email phone qualification experience specialties consultationFee bio profileImage"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Optional: check verification
    // if (!doctor.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Doctor not verified",
    //   });
    // }

    res.status(200).json({
      success: true,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        qualification: doctor.qualification,
        specialty: doctor.specialties?.join(", "),
        experience: doctor.experience,
        image: doctor.profileImage,
        about: doctor.bio,
        rating: doctor.rating || 4.5,
        email: doctor.email,
        phone: doctor.phone,
        consultationFee: doctor.consultationFee,
        timings: doctor.timings || "Mon - Sat, 10:00 AM - 7:00 PM",
      },
    });
  } catch (err) {
    console.error("Doctor details error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update profile image and specialization
exports.updateProfile = async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            phone:req.body.phone,
            qualification: req.body.qualification,
            experience: req.body.experience,
            specialties: req.body.specialties,
            consultationFee: req.body.consultationFee,
            bio: req.body.bio,
        };

        // If image uploaded
        if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "uploads");
      updateData.profileImage = result.url;
    }

        const doctor = await Doctor.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select("-password");

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.json({
            message: "Profile updated successfully",
            doctor,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Get own appointments
exports.getAppointments = async (req, res) => {
    try {
        const doctorId = req.user.id;

        // Query params
        const search = req.query.search || "";
        const status = req.query.status || ""; 
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter
        let filter = { doctorId };

        if (search) {
            filter.patientName = { $regex: search, $options: "i" };
        }

        if (status) {
            filter.status = status;
        }

        // Fetch data
        const [appointments, total] = await Promise.all([
            Appointment.find(filter)
                .populate("doctorId", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            Appointment.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            
           data: appointments,
            pagination:{
              page,
            totalPages,
            total,
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



exports.getDashboard = async (req, res) => {
  try {
    const doctorId = req.user.id; // set by auth middleware

    // counts
    const appointmentsCount = await Appointment.countDocuments({ doctorId });
    const blogsCount = await Blog.countDocuments({ doctorId });

    // earnings in last 6 months (example)
    const earningsAgg = await Appointment.aggregate([
      { $match: { doctorId: doctorId, status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$fee" } } },
    ]);
    const earnings = earningsAgg[0]?.total || 0;

    // recent appointments
    const recentAppointments = await Appointment.find({ doctorId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("patientName date time status fee type");

    // small series for chart (you should create real monthly aggregation)
    const earningsSeries = {
      labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
      values: [8000, 12000, 9000, 15000, 17000, 19000],
    };

    // optionally calculate newPatients / cancelled
    const newPatients = 12;
    const cancelled = 2;

    return res.json({
      appointmentsCount,
      blogsCount,
      earnings,
      subscription: { status: "Active - Monthly" /* or real data */ },
      newPatients,
      cancelled,
      recentAppointments,
      earningsSeries,
    });

  } catch (err) {
    console.error("dashboard error", err);
    res.status(500).json({ message: "Server error" });
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


