const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: {
    type: String, // "2025-11-05"
    required: true,
  },
  times: [
    {
      time: String, // "10:00 AM"
      isBooked: { type: Boolean, default: false },
    },
  ],
});

module.exports =mongoose.model("Slot", slotSchema);
