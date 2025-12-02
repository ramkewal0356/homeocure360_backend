const mongoose = require("mongoose");
const cartOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ productId: mongoose.Schema.Types.ObjectId, qty: Number, price: Number }],
  totalAmount: { type: Number, required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("CartOrder", cartOrderSchema);
