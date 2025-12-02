const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  text: { type: String, required: true },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
});

const blogSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },

  title: { type: String, required: true },
  slug: { type: String, unique: true },

  categoryId: { type: Number, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },

  tags: [{ type: String }],
  metaTitle: { type: String },
  metaDescription: { type: String },

  likes: { type: Number, default: 0 },
  likedIPs: [{ type: String }],
  comments: [commentSchema],
  views: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
