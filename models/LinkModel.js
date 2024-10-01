const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    user: String,
    machine: Number,
    description: String,
    name: String,
    url: String,
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

module.exports = mongoose.model('Link', linkSchema);