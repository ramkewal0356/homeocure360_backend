const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    plan: { type: String, enum: ['monthly','yearly'], required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: { type: String, enum: ['pending','paid'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
