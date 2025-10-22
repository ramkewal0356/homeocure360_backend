const router = require('express').Router();
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/authMiddleware');

// Book appointment (public user)
router.post('/', authMiddleware('user'), async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;
        const appointment = await Appointment.create({
            userId: req.user.id,
            doctorId,
            date,
            time
        });
        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's appointments
router.get('/my', authMiddleware('user'), async (req, res) => {
    const appointments = await Appointment.find({ userId: req.user.id }).populate('doctorId', 'userId specialization');
    res.json(appointments);
});

module.exports = router;
