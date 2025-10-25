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

// ---------------- DB Middleware ----------------
// Connect DB on each request using singleton
connectDB();
// ---------------- Export app ----------------
module.exports = app; // no app.listen()
