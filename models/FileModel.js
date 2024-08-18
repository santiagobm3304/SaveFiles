const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    user: String,
    description: String,
    originalname: String,
    filename: String,
    path: String,
    size: Number,
    mimetype: String,
    createdAt: { 
        type: String, 
        default: () => {
            const today = new Date();
            return today.toISOString().split('T')[0]; // Devuelve "YYYY-MM-DD"
        }
    }
});

module.exports = mongoose.model('File', fileSchema);
