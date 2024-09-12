const express = require('express');
const mongoose = require('mongoose');
require('./libs/initialSetUp');
const dotenv = require('dotenv');
const cors = require('cors');
const fileRoutes = require('./routes/FileRoute');
const userRoutes = require('./routes/UserRoute');

dotenv.config();

const app = express();
const fs = require('fs');
const path = require('path');

function createUploads() {
    const uploadDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
        console.log('ok');
    } else {
        console.log('----------------------------------------------------------------')
    }
}

app.use(express.static(path.join(process.cwd(), 'public')));
app.use(cors());

// Ruta para la vista principal
app.get('/login', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'login.html'));
});
app.get('/machines', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'machines.html'));
});
app.get('/:page', (req, res) => {
    const page = req.params.page;
    const validPages = ['index', 'upload', 'update'];

    if (validPages.includes(page)) {
        res.sendFile(path.join(process.cwd(), 'views', `${page}.html`));
    } else {
        res.status(404).send('Página no encontrada');
    }
});


// Ejecutar la función
createUploads();
// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/savefiles').then(() => console.log('MongoDB conectado'))
  .catch(err => console.log('Error al conectar a MongoDB:', err.message));

app.use(express.json());
app.use('/api/files', fileRoutes);
app.use('/api/auth', userRoutes.router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}/login`);
});