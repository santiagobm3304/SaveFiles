const express = require('express');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const router = express.Router();

const createNewUsuario = async (nuevoUsuario) => {

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ correo: nuevoUsuario.correo });
    if (usuarioExistente) {
        throw new Error('El usuario con ese correo ya existe');
    }

    // Verificar si la clave está definida
    if (!nuevoUsuario.clave) {
        throw new Error('La clave es requerida para crear un nuevo usuario');
    }

    // Encriptar la clave
    nuevoUsuario.clave = await User.encryptClave(nuevoUsuario.clave);

    // Crear una nueva instancia del modelo User si es necesario
    const usuarioCreado = new User(nuevoUsuario);

    // Guardar el usuario en la base de datos
    return await usuarioCreado.save();
};

const loginUsuario = async (correo, clave) => {
    const usuarioEncontrado = await User.findOne({ correo: correo });
    if (!usuarioEncontrado) return 0;
    const clavesIguales = await User.comparePassword(clave, usuarioEncontrado.clave);
    if (!clavesIguales) return 1;

    return usuarioEncontrado;
}

router.post('/signin', async (req, res) => {
    try {
        const { body } = req;
        const usuario = await loginUsuario(body.correo, body.clave);

        if (usuario == 0) {
            return res.status(400).json({
                status: 'error',
                code: 400,
                message: 'No existe algún usuario con el correo ingresado',
                errors: {
                    email: 'No existe algún usuario con el correo ingresado'
                }
            });
        }
        if (usuario == 1) {
            return res.status(400).json({
                status: 'error',
                code: 400,
                message: 'La contraseña es incorrecta',
                errors: {
                    password: 'La contraseña es incorrecta'
                }
            });
        }
        const tokenPayload = {
            id: usuario._id,
            nombre: usuario.nombre,
            correo: usuario.correo
        };
        const token = jwt.sign(tokenPayload, "S4V3F1L3S", {
            expiresIn: 86400
        })
        res.status(200).json({
            status: 'success',
            code: 200,
            message: 'Inicio de Sesión Exitoso',
            data: {
                user: {
                    id: usuario._id,
                    name: usuario.nombre,
                    email: usuario.correo
                },
                token: token
            }
        });
        return
    } catch (error) {
        res.status(500).json({
            status: 'error',
            code: 500,
            message: 'Error al Logearse',
            errors: error
        });
        return
    }

});

module.exports = {
    createNewUsuario,
    loginUsuario,
    router
};