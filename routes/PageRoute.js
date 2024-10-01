const express = require('express');
const User = require('../models/UserModel');
const path = require('path');

const router = express.Router();

// Función para manejar las páginas generales
router.get('/:page', (req, res) => {
    const page = req.params.page;
    const validPages = ['login', 'machines'];

    if (validPages.includes(page)) {
        res.sendFile(path.join(process.cwd(), 'views', `${page}.html`));
    } else {
        res.status(404).send('Página no encontrada');
    }
});

// Función para manejar las páginas de archivos
router.get('/files/:page', (req, res) => {
    const page = req.params.page;
    const validPages = ['index', 'update', 'upload'];

    if (validPages.includes(page)) {
        res.sendFile(path.join(process.cwd(), 'views', `file/${page}.html`));
    } else {
        res.status(404).send('Página no encontrada');
    }
});
// Función para manejar las páginas de enlaces
router.get('/links/:page', (req, res) => {
    const page = req.params.page;
    const validPages = ['index', 'update', 'upload'];

    if (validPages.includes(page)) {
        res.sendFile(path.join(process.cwd(), 'views', `link/${page}.html`));
    } else {
        res.status(404).send('Página no encontrada');
    }
});

router.get('/client/:user/:page', (req, res) => {
    const { user, page } = req.params;
    const validPages = ['inicio', 'files'];
    const userFound = User.findById(user);
    if(!userFound){
        res.status(500).send('Usuario no encontrado');
    } else{
        if (validPages.includes(page)) {
            res.sendFile(path.join(process.cwd(), 'views', `client/${page}.html`));
        } else {
            res.status(404).send('Página no encontrada');
        }
    }    
});

module.exports = router;
