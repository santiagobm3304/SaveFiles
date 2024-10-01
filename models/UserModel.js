const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        unique: true,
        required: true
    },
    rol: {
        type: Number,
        default: 2,
        required: true
    },
    correo: {
        type: String,
        unique: true,
        required: true
    },
    clave: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});


userSchema.statics.encryptClave = async (clave) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(clave, salt);
};

userSchema.statics.comparePassword = async (password, receivedPassword) => {
    return await bcrypt.compare(password, receivedPassword);
};

module.exports = mongoose.model('User', userSchema);