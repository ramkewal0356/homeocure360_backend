const mongoose = require('mongoose');

// const appointmentSchema = new mongoose.Schema({
//     // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
//     date: { type: Date, required: true },
//     time: { type: String, required: true },
//     // status: { type: String, enum: ['pending','completed','cancelled'], default: 'pending' }
// }, { timestamps: true });
const appointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientName: { type: String, required: true },
  patientEmail: { type: String },
  patientPhone: { type: String, required: true },
  razorpayOrderId:{type:String},
  razorpayPaymentId:{type:String},
  date: { type: Date, required: true },
  time: { type: String, required: true },
  reason: { type: String },
  fee:Number,
  type:{type:String,enum:['Online','Offline'],default:"Offline"},
   status: { type: String, enum: ['pending','paid'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
