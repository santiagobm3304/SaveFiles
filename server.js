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
    const uploadsDir = path.join(__dirname, 'uploads');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
        console.log('Carpeta "uploads" creada exitosamente.');
    } else {
        console.log('----------------------------------------------------------------')
    }
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Ruta para la vista principal
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'upload.html'));
});
app.get('/update', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'update.html'));
});

// Ejecutar la función
createUploads();
// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB conectado'))
  .catch(err => console.log('Error al conectar a MongoDB:', err.message));

app.use(express.json());
app.use('/api/files', fileRoutes);
app.use('/api/auth', userRoutes.router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
