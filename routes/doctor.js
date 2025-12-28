const router = require('express').Router();
const { getProfile, updateProfile, getAppointments, registerDoctor, loginDoctor, getSubscribedDoctors, getDashboard, getDoctorDetailsPublic} = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
// const multer = require('multer');

// const upload = multer({ dest: 'uploads/' });
const upload = require('../middleware/multer.upload');


router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.get('/getprofile',authMiddleware('doctor'), getProfile);
router.put('/update-profile', authMiddleware('doctor'),upload.single('profileImage'), updateProfile);
router.get('/appointments', authMiddleware('doctor'),getAppointments);
router.get("/dashboard", authMiddleware('doctor'), getDashboard);
router.get("/public/:doctorId", getDoctorDetailsPublic);
// router.post('/create-blog', authMiddleware('doctor'),upload.single('image'), createBlog);
// router.get('/blogs', authMiddleware('doctor'),getBlogs);
router.get('/get_all_subscribed',getSubscribedDoctors);
// router.get("/:doctorId/slots",getSlotByDoctorId);

module.exports = router;
