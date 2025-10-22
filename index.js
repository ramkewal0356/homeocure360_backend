const express= require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB= require('./db_config/db_config');
const authRoutes= require('./routes/auth');
const doctorRoutes= require('./routes/doctor');
const blogRoutes= require('./routes/blog');
const apointmentRoutes=  require('./routes/appointment');
const adminRoutes=  require('./routes/admin');
const paymentRoutes=  require('./routes/payment');
const PORT = process.env.PORT || 8000;
// middleware
const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));
// routes
app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes );
app.use('/api/blog', blogRoutes); 
app.use('/api/appointment',apointmentRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/payment',paymentRoutes);



connectDB().then(()=>{
    app.listen(PORT, ()=> console.log('Server running on', PORT));
});