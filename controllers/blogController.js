const { uploadToCloudinary } = require('../middleware/uploadToCloudinary');
const Blog = require('../models/Blog');
// const uploadFile= require('../utils/cloudinary.upload');
// Public: Get all verified blogs
exports.getVerifiedBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ verified: true }).populate('doctorId', 'userId specialization');
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Doctor: Create a blog
exports.createBlog = async (req, res) => {
    try {
         const { title, content } = req.body;
          if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // let imageUrl = null;

    // if (req.file) {
    //   // Upload to cloudinary
    // //   imageUrl = await uploadFile(req.file.path,"uploads",);
   
    // }
const result = await uploadToCloudinary(req.file.buffer,"uploads");
    const blog = await Blog.create({
      doctorId: req.user.id,
      title,
      content,
      image: result.url,
    });

    res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Doctor: Get their own blogs
exports.getDoctorBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ doctorId: req.user.id });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Verify blog
exports.verifyBlog = async (req, res) => {
    try {
        const { blogId } = req.body;
        const blog = await Blog.findByIdAndUpdate(blogId, { verified: true }, { new: true });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Delete blog
exports.deleteBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        await Blog.findByIdAndDelete(blogId);
        res.json({ message: "Blog deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllBlog=async(req,res)=>{
    try {
    const blogs= await Blog.find().sort({createdAt:-1}).populate('doctorId','name') 
   res.json({ success: true, blogs });  
    } catch (error) {
      res.status(500).json({ message: error.message });   
    }
}
