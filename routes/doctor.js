const router = require('express').Router();
const { getProfile, updateProfile, getAppointments, createBlog, getBlogs, registerDoctor, loginDoctor, getSubscribedDoctors } = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

// router.use(authMiddleware('doctor'));
router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.get('/profile',authMiddleware('doctor'), getProfile);
router.put('/profile', authMiddleware('doctor'),upload.single('profileImage'), updateProfile);
router.get('/appointments', authMiddleware('doctor'),getAppointments);
router.post('/create-blog', authMiddleware('doctor'),upload.single('image'), createBlog);
router.get('/blogs', authMiddleware('doctor'),getBlogs);
router.get('/get_all_subscribed',getSubscribedDoctors);

module.exports = router;
