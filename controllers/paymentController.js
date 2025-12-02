const Razorpay = require('razorpay');
const Subscription = require('../models/Subscription');
const Doctor = require('../models/Doctor');
const crypto = require("crypto");
const CartOrder = require('../models/CartOrder');
const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// // Create subscription order
// exports.createSubscription = async (req, res) => {
//     try {
//         const { plan } = req.body; // monthly/yearly
//         const amount = plan === 'monthly' ? 100 : 1000; // in INR, convert to paise
//         const options = {
//             amount: amount * 100,
//             currency: "INR",
//             receipt: `receipt_order_${Date.now()}`
//         };

//         const order = await instance.orders.create(options);
//         const subscription = await Subscription.create({
//             doctorId: req.user.id,
//             plan,
//             razorpayOrderId: order.id,
//              status: "pending"
//         });

//         res.json({success:true, order, subscriptionId:subscription._id, plan: subscription.plan, });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// // Verify payment
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, subscriptionId } = req.body;

//     // Step 1: Verify signature
//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(sign.toString())
//       .digest("hex");

//     if (razorpay_signature !== expectedSign) {
//       return res.status(400).json({ success: false, message: "Invalid signature" });
//     }

//     // Step 2: Update subscription status
//     const subscription = await Subscription.findByIdAndUpdate(
//       subscriptionId,
//       { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, status: "paid" },
//       { new: true }
//     );

//     if (!subscription) {
//       return res.status(404).json({ success: false, message: "Subscription not found" });
//     }

//     // Step 3: Update doctor subscription flag
//     await Doctor.findOneAndUpdate(
//       { _id: subscription.doctorId },
//       { subscription: true, subscriptionPlan: subscription.plan }
//     );

//     res.json({ success: true, message: "Payment verified & subscription activated", subscription });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).json({ success: false, message: "Payment order failed" });
  }
};

exports.saveTempData = async (req, res) => {
  try {
    const { type, data } = req.body;
       if (!type) {
      return res.status(400).json({ success: false, message: "Type is required" });
    }

    if (!data || !data.razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    if (type === "appointment") {
      await Appointment.create({ ...data, status: "pending" });
    }

    if (type === "subscription") {
      await Subscription.create({ ...data, status: "pending" });
    }

    if (type === "cart") {
      await CartOrder.create({ ...data, status: "pending" });
    }

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Common payment verification function
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSign !== razorpay_signature)
      return res.json({ success: false });

    // Appointment
   const appt = await Appointment.findOne({ razorpayOrderId: razorpay_order_id });

    if (appt) {
      appt.status = "paid";
      appt.razorpayPaymentId = razorpay_payment_id;
      await appt.save();

      // ✅ Mark Slot as booked
      const slot = await Slot.findOneAndUpdate(
        {
          doctorId: appt.doctorId,
          date: appt.date,
          time: appt.time,
        },
        { status: "booked" },
        { new: true }
      );

      // Optional — add slot to doctor db
      if (slot) {
        await Doctor.findByIdAndUpdate(appt.doctorId, {
          $addToSet: { slots: slot._id },
        });
      }

      return res.json({
        success: true,
        type: "appointment",
        message: "Payment verified, slot booked",
      });
    }
console.log('okay.....');
    // Subscription
    let sub = await Subscription.findOne({ razorpayOrderId: razorpay_order_id });
    if (sub) {
      sub.status = "paid";
      sub.razorpayPaymentId = razorpay_payment_id;
      await sub.save();
  // Calculate subscription dates
  const startDate = new Date();
  let endDate = new Date(startDate);

  if (sub.plan === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (sub.plan === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
     // Update doctor subscription details
  await Doctor.findByIdAndUpdate(sub.doctorId, {
    subscription: true,
    subscriptionPlan: sub.plan,
    subscriptionStart: startDate,
    subscriptionEnd: endDate
  });


      return res.json({ success: true, type: "subscription" });
    }

    // Cart Order
    let cart = await CartOrder.findOne({ razorpayOrderId: razorpay_order_id });
    if (cart) {
      cart.status = "paid";
      cart.razorpayPaymentId = razorpay_payment_id;
      await cart.save();
      return res.json({ success: true, type: "cart" });
    }

    return res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};
