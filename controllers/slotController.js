const Doctor = require("../models/Doctor");
const Slot = require("../models/Slot");

exports.createSlot=  async (req, res) => {
  try {
    const { date, times } = req.body; // e.g. {date: "2025-11-05", times: ["10:00 AM", "11:00 AM"]}

    const newSlot = await Slot.create({
      doctor: req.params.doctorId,
      date,
      times: times.map((t) => ({ time: t })),
    });

    await Doctor.findByIdAndUpdate(req.params.doctorId, {
      $push: { slots: newSlot._id },
    });

    res.json({ success: true, slot: newSlot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getSlotByDoctorId=  async (req, res) => {
  try {
    const slots = await Slot.find({ doctor: req.params.doctorId }).sort({ date: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

exports.bookSlot= async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    const slot = await Slot.findOne({ doctor: doctorId, date });
    const slotTime = slot.times.find((s) => s.time === time);

    if (slotTime.isBooked) {
      return res.status(400).json({ success: false, message: "Slot already booked!" });
    }

    slotTime.isBooked = true;
    await slot.save();

    res.json({ success: true, message: "Slot booked successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
