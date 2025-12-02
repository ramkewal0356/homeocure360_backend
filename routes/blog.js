const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload= require('../middleware/multer.upload');
const blogController = require('../controllers/blogController');


// ---------------------- DOCTOR ROUTES ----------------------

// create blog
router.post("/create-blog", authMiddleware('doctor'), upload.single("image"), blogController.createBlog);

// my blogs
router.get("/getDoctorBlogs", authMiddleware('doctor'), blogController.getDoctorBlogs);

// update blog
router.put("/update-blog/:blogId", authMiddleware('doctor'), upload.single("image"), blogController.updateBlog);

// delete blog (both admin and doctor allowed)
router.delete("/deleteblog/:blogId", blogController.deleteBlog);

// ---------------------- PUBLIC ROUTES ----------------------

// all blogs
router.get("/get_all_blogs", blogController.getAllBlog);
router.get("/bloglist", blogController.listBlogs); 
// single blog
router.get("/getBlogById/:id", blogController.getSingleBlog);

router.put("/:id/view", blogController.incrementView);   // increment view
router.put("/:id/like", blogController.likeBlog);        // like (IP-based)
router.post("/:id/comment", blogController.addComment);  // add comment
router.post("/:id/comment/:commentId/reply", blogController.addReply); // add reply

// ---------------------- ADMIN ROUTE (optional) ----------------------
// router.delete("/admin/blog/:blogId", authAdmin, deleteBlog);

module.exports = router;