const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { verifyDoctor, getAllDoctors, getAllUsers, getAllBlogs, getAllAppointments, registerSetup, loginAdmin, getAllDoctorsForAdmin, getAllBlogsAdmin, deleteBlogAdmin, getRecentAppointments, getDashboardStats } = require('../controllers/adminController');


// router.use(authMiddleware('admin'));
router.post('/setup',registerSetup);
router.post('/login',loginAdmin);
router.put('/verify-doctor/:id',authMiddleware('admin'), verifyDoctor);
router.get("/dashboard/stats", authMiddleware('admin'), getDashboardStats);
router.get(
  "/dashboard/recent-appointments",
  authMiddleware('admin'),
  getRecentAppointments
);
router.get("/doctors", authMiddleware('admin'), getAllDoctorsForAdmin);
router.put("/doctor/:doctorId/verify", authMiddleware('admin'), verifyDoctor);
router.get('/users', authMiddleware('admin'),getAllUsers);
router.get("/blogs", authMiddleware('admin'), getAllBlogsAdmin);
router.delete("/blogs/:blogId", authMiddleware('admin'), deleteBlogAdmin);

router.get('/appointments',authMiddleware('admin') ,getAllAppointments);

module.exports = router;
