const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db_config/db_config'); // use singleton in db_config
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const blogRoutes = require('./routes/blog');
const appointmentRoutes = require('./routes/appointment');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const contactRoutes= require('./routes/contact');
const slotRoutes= require('./routes/slot');
const subscriptionRoutes = require('./routes/subscription');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ---------------- Routes ----------------
app.get('/', (req, res) => {
  res.send('Homeo Cure backend is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscription',subscriptionRoutes)
app.use('/api/contact',contactRoutes);
app.use('/api/slot',slotRoutes)
// Detect environment and PORT
const ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 4000;

// Only start the Express listener if NOT on Vercel
if (ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${ENV} mode on port ${PORT}`);
  });
}
// ---------------- DB Middleware ----------------
// Connect DB on each request using singleton
connectDB();
// app.use(async (req, res, next) => {
//   try {
//     await connectDB();
//     next();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database connection failed' });
//   }
// });

// ---------------- Export app ----------------
module.exports = app; // no app.listen()
