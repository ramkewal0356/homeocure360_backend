const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload')
const {
    getVerifiedBlogs,
    createBlog,
    getDoctorBlogs,
    verifyBlog,
    deleteBlog,
    getAllBlog
} = require('../controllers/blogController');

// Public: Get verified blogs
router.get('/verified', getVerifiedBlogs);
router.get('/get_all_blogs',getAllBlog);
// Doctor routes
// router.use(authMiddleware('doctor'));
router.post('/create_blog',authMiddleware('doctor'), upload.single('image'), createBlog);
router.get('/my', getDoctorBlogs);

// Admin routes
router.use(authMiddleware('admin'));
router.put('/verify', verifyBlog);
router.delete('/:blogId', deleteBlog);

module.exports = router;
