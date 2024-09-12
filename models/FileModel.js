const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    user: String,
    machine: Number,
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
            today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
            return today.toISOString().split('T')[0]; //"YYYY-MM-DD"
        }
    }
});

module.exports = mongoose.model('File', fileSchema);
