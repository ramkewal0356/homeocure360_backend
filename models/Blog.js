const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
   
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
