const Razorpay = require('razorpay');
const Subscription = require('../models/Subscription');
const Doctor = require('../models/Doctor');
const crypto = require("crypto");
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create subscription order
exports.createSubscription = async (req, res) => {
    try {
        const { plan } = req.body; // monthly/yearly
        const amount = plan === 'monthly' ? 100 : 1000; // in INR, convert to paise
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await instance.orders.create(options);
        const subscription = await Subscription.create({
            doctorId: req.user.id,
            plan,
            razorpayOrderId: order.id,
             status: "pending"
        });

        res.json({success:true, order, subscriptionId:subscription._id, plan: subscription.plan, });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, subscriptionId } = req.body;

    // Step 1: Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Step 2: Update subscription status
    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, status: "paid" },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    // Step 3: Update doctor subscription flag
    await Doctor.findOneAndUpdate(
      { _id: subscription.doctorId },
      { subscription: true, subscriptionPlan: subscription.plan }
    );

    res.json({ success: true, message: "Payment verified & subscription activated", subscription });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};