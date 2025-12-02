const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Slot = require("../models/Slot");

// Create appointment record
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientName,patientPhone,patientEmail, date, time, razorpayOrderId } = req.body;

    const appointment = await Appointment.create({
      doctorId,
      patientName,
      patientPhone,
      patientEmail,
      date,
      time,
      razorpayOrderId,
      status: "pending",
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update after payment verification

exports.confirmAppointment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId } = req.body;

    // ✅ Step 1: Find and update appointment
    const appointment = await Appointment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, status: "paid" },
      { new: true }
    );

    if (!appointment)
      return res.status(404).json({ success: false, message: "Appointment not found" });

    // ✅ Step 2: Find the slot and mark it as booked
    const slot = await Slot.findOneAndUpdate(
      {
        doctorId: appointment.doctorId,
        date: appointment.date,
        time: appointment.time,
      },
      { status: "booked" },
      { new: true }
    );

    // ✅ Step 3: Ensure doctor model links to slot
    if (slot) {
      await Doctor.findByIdAndUpdate(appointment.doctorId, {
        $addToSet: { slots: slot._id }, // Avoid duplicates
      });
    }

    res.json({
      success: true,
      message: "Appointment confirmed and slot booked",
      appointment,
      bookedSlot: slot,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

