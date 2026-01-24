const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    content: { type: String, required: true }, // HTML content
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
