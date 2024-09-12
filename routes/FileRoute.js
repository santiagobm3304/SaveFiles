const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/UserModel');
const File = require('../models/FileModel');
const router = express.Router();

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers["x-access-token"];
        if (!token) return res.status(403).json({ message: "No hay token" });
        const decoded = jwt.verify(token, "S4V3F1L3S");
        req.usuarioId = decoded.id;

        const usuario = await User.findById(req.usuarioId);

        if (!usuario) return res.status(404).json({ message: "usuario no encontrado" });
        next();

    } catch (error) {
        return res.status(401).json({ message: 'No autorizado' })
    }
};

// Configuración de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/download/:id', async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await File.findById(fileId);
        if (!file) return res.status(404).json({ message: 'Archivo no encontrado' });

        const filePath = path.join(process.cwd(), 'uploads', file.filename); // Ajusta la ruta según tu estructura de carpetas
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });

        res.download(filePath, file.filename); // Envía el archivo para descarga
    } catch (error) {
        res.status(500).json({ message: 'Error al descargar el archivo', error });
    }
});
router.get('/file/:id', verifyToken, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }
        res.status(200).json(file);
    } catch (err) {
        console.error('Error al obtener el archivo:', err);
        res.status(500).json({ message: 'Error al obtener el archivo', error: err.message });
    }
});
router.put('/update/:id', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }
        if (req.file) {
            if (req.file.originalname !== file.originalname || req.file.mimetype !== file.mimetype) {
                return res.status(400).json({ message: 'El archivo debe tener el mismo nombre y tipo' });
            }
            fs.unlinkSync(path.join(process.cwd(), 'uploads', file.filename));

            // Actualizar los detalles del archivo
            file.filename = req.file.filename;
            file.path = req.file.path;
            file.size = req.file.size;
            file.mimetype = req.file.mimetype;
        }
        file.description = req.body.description || file.description;

        await file.save();
        res.status(200).json(file);
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar el archivo', error: err.message });
    }
});
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const file = await File.findByIdAndDelete(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }
        const filePath = path.join(file.path);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error al eliminar el archivo del sistema de archivos:', err);
                return res.status(500).json({ message: 'Error al eliminar el archivo del sistema de archivos', error: err.message });
            }

            res.status(200).json({ message: 'Archivo eliminado' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el archivo', error: err.message });
    }
});
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { user, machine, description } = req.body;
        if (!user || !machine) {
            return res.status(400).json({ message: 'Los campos "usuario" y "máquina" son requeridos.' });
        }
        const existingFile = await File.findOne({ filename: req.file.filename });

        if (existingFile) {
            return res.status(400).json({ message: 'Ya existe un archivo con el mismo nombre' });
        }
        const file = new File({
            user: user,
            machine: machine,
            description: description,
            originalname: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
        await file.save();
        res.status(201).json(file);
    } catch (err) {
        res.status(500).json({ message: 'Error al subir el archivo', error: err.message });
    }
});
router.get('/search', verifyToken, async (req, res) => {
    try {
        const { filename, mimetype, createdAt } = req.query;
        const machine = Number(req.query.machine);
        const filters = {};
        if (machine) filters.machine = machine;
        if (filename) filters.filename = new RegExp(filename, 'i');
        if (mimetype) filters.mimetype = mimetype;
        if (createdAt) filters.createdAt = createdAt;
        const files = await File.find(filters).exec();

        return res.status(200).json(files);
    } catch (err) {
        return res.status(500).json({ message: 'Error al obtener archivos', error: err.message });
    }
});
router.get('/:machine', verifyToken, async (req, res) => {
    try {
        const machineId = req.params.machine;

        const files = await File.find({ machine: machineId });

        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'No hay archivos por ahora' });
        }

        return res.status(200).json(files);
    } catch (err) {
        console.error('Error al obtener los archivos:', err);
        return res.status(500).json({ message: 'Error al obtener el archivo', error: err.message });
    }
});
router.get('/', verifyToken, async (req, res) => {
    try {
        const files = await File.find();
        res.status(200).json(files);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener archivos', error: err.message });
    }
});
module.exports = router;
