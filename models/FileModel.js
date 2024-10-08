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
    expire: {
        type: Boolean,
        default: false
    },
    hoursToExpire: Number, // Campo para ingresar las horas manualmente
    expirationTime: Date,  // Fecha y hora calculada cuando expire
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
