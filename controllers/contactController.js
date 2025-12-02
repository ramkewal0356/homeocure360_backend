
// import Contact from "../models/contactModel.js";
// import nodemailer from "nodemailer";
const Contact = require('../models/Contact');
const nodemailer= require('nodemailer');



exports.createContact = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ success: false, message: "Name, phone, and message are required" });
    }

    const newMsg = new Contact({ name, phone, email, message });
    await newMsg.save();

    // Optional: Email notification (only if email exists)
    // if (process.env.EMAIL_USER && email) {
    //   const transporter = nodemailer.createTransport({
    //     // service: "gmail",
    //     service:"smtp.hostinger.com",
    //     secure:false,
    //     port:587,
    //     auth: {
    //       user: process.env.EMAIL_USER,
    //       pass: process.env.EMAIL_PASS,
    //     },
    //   });

    //   await transporter.sendMail({
    //     from: process.env.EMAIL_USER,
    //     to: process.env.EMAIL_USER,
    //     subject: `New Contact Message from ${name}`,
    //     text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email || "N/A"}\nMessage: ${message}`,
    //   });
    // }

    res.status(201).json({ success: true, message: "Message saved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllMessage= async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


