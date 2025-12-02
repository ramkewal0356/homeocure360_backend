const  uploadToCloudinary  = require('../middleware/uploadToCloudinary');
const Blog = require('../models/Blog');


// Doctor: Create a blog


function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return xff.split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || "";
}

// ---------------------- CREATE BLOG (Doctor) ----------------------

// Utility to create slug
const createSlug = (title) =>
  title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

// ---------------- Create Blog ----------------
exports.createBlog = async (req, res) => {
  try {
    const { title, categoryId, shortDescription, content, tags, metaTitle, metaDescription } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: "Image required" });

    const result = await uploadToCloudinary(req.file.buffer, "uploads");

    const blog = await Blog.create({
      doctorId: req.user.id,
      title,
      slug: createSlug(title),
      categoryId,
      shortDescription,
      content,
      tags: JSON.parse(tags || "[]"),
      metaTitle,
      metaDescription,
      image: result.url,
    });

    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Update Blog ----------------
exports.updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    let updateData = {
      title: req.body.title,
      slug: createSlug(req.body.title),
      categoryId: req.body.categoryId,
      shortDescription: req.body.shortDescription,
      content: req.body.content,
      tags: JSON.parse(req.body.tags || "[]"),
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
    };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "uploads");
      updateData.image = result.url;
    }

    const blog = await Blog.findOneAndUpdate(
      { _id: blogId, doctorId: req.user.id },
      updateData,
      { new: true }
    );

    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Get Blogs (with search + category + pagination) ----------------
exports.getDoctorBlogs = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const categoryId = req.query.categoryId || "";

    const filters = {
      doctorId,
      title: { $regex: search, $options: "i" },
    };

    if (categoryId) filters.categoryId = categoryId;

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("doctorId", "name"),
      Blog.countDocuments(filters),
    ]);

    res.json({
      success: true,
      blogs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- DELETE BLOG (Doctor or Admin) ----------------------
exports.deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    await Blog.findByIdAndDelete(blogId);

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- PUBLIC: Get All Blogs ----------------------
exports.getAllBlog = async (req, res) => {
  try {
    const { search = "", categoryId = "", page = 1, limit = 6 } = req.query;

    const query = {};

    // 🔍 Search Blog
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 🎯 Filter by categoryId
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      blogs,
      pagination:{
         total,
      page: Number(page),
        totalPages:Math.ceil(total / limit)
      }
     
     
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ---------------------- PUBLIC: Get Single Blog ----------------------
exports.getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("doctorId", "name email");

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Public: increment view count (call when page loads)
 */
exports.incrementView = async (req, res) => {
  try {
    const blogId = req.params.id;
    const result = await Blog.findByIdAndUpdate(blogId, { $inc: { views: 1 } }, { new: true });
    res.json({ success: true, views: result.views });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// ---------------------- PUBLIC: LIKE BLOG ----------------------
exports.likeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const ip = getClientIp(req);

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ success: false, message: "Not found" });

    if (blog.likedIPs.includes(ip)) {
      return res.json({ success: false, message: "Already liked" });
    }

    blog.likes = (blog.likes || 0) + 1;
    blog.likedIPs.push(ip);
    await blog.save();

    res.json({ success: true, likes: blog.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------- PUBLIC: COMMENT BLOG ----------------------
exports.addComment = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { name, email, text } = req.body;
    if (!name || !email || !text) {
      return res.status(400).json({ success: false, message: "name, email and text required" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ success: false, message: "Not found" });

    blog.comments.push({ name, email, text });
    await blog.save();

    // return the latest comments or the whole blog
    res.json({ success: true, comments: blog.comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
/**
 * Public: Reply to a comment
 */
exports.addReply = async (req, res) => {
  try {
    const blogId = req.params.id;
    const commentId = req.params.commentId;
    const { name, email, text } = req.body;
    if (!name || !email || !text) {
      return res.status(400).json({ success: false, message: "name, email and text required" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ success: false, message: "Not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    comment.replies.push({ name, email, text });
    await blog.save();

    res.json({ success: true, comments: blog.comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Public: List blogs with pagination
 * GET /api/blogs?page=1&limit=10
 */
exports.listBlogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "10", 10));
    const skip = (page - 1) * limit;

    const [total, blogs] = await Promise.all([
      Blog.countDocuments(),
      Blog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("doctorId", "name"),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({ success: true, page, totalPages, total, blogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};