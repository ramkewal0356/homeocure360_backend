const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { verifyDoctor, getAllDoctors, getAllUsers, getAllBlogs, getAllAppointments, registerSetup, loginAdmin } = require('../controllers/adminController');

// router.use(authMiddleware('admin'));
router.post('/setup',registerSetup);
router.post('/login',loginAdmin);
router.put('/verify-doctor/:id',authMiddleware('admin'), verifyDoctor);
router.get('/doctors', authMiddleware('admin'),getAllDoctors);
router.get('/users', authMiddleware('admin'),getAllUsers);
router.get('/blogs', authMiddleware('admin'),getAllBlogs);
router.get('/appointments',authMiddleware('admin') ,getAllAppointments);

module.exports = router;
