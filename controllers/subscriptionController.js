const Subscription = require("../models/Subscription");
const Doctor = require("../models/Doctor");

// Create a subscription record (after Razorpay order created)
exports.createSubscription = async (req, res) => {
  try {
    const { doctorId, plan, razorpayOrderId } = req.body;

    const subscription = await Subscription.create({
      doctorId,
      plan,
      razorpayOrderId,
      status: "pending",
    });

    res.status(201).json({ success: true, subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update after payment verification
exports.activateSubscription = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId } = req.body;

    const subscription = await Subscription.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, status: "active" },
      { new: true }
    );

    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    await Doctor.findByIdAndUpdate(subscription.doctorId, { subscription: true });

    res.json({ success: true, message: "Subscription activated", subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
