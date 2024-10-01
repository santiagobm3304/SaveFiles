const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fileRoutes = require('./routes/FileRoute');
const linkRoutes = require('./routes/LinkRoute');
const userRoutes = require('./routes/UserRoute');
const pageRoutes = require('./routes/PageRoute');

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


// Ejecutar la función
createUploads();
// Conectar a MongoDB
mongoose.connect('mongodb+srv://Tiago:tysonryx123@projects.dkslbjj.mongodb.net/savefiles?retryWrites=true&w=majority&appName=Projects').then(() => console.log('MongoDB conectado'))
  .catch(err => console.log('Error al conectar a MongoDB:', err.message));

app.use(express.json());
app.use('/', pageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/auth', userRoutes.router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}/login`);
});