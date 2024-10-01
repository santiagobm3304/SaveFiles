const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const cron = require('node-cron');
const Link = require('../models/LinkModel');
const router = express.Router();


async function checkAndExpireLink(link) {
    const currentTime = new Date();
    const localtime = new Date(currentTime - currentTime.getTimezoneOffset() * 60 * 1000)
    // Verifica si el enlace ha expirado
    if (link.expirationTime && localtime >= link.expirationTime) {
        link.expire = true;
        await link.save();
    }
}
cron.schedule('* * * * *', async () => {
    try {
        // Buscar todos los enlaces que aún no han expirado
        const links = await Link.find({ expire: false });

        // Verificar si cada enlace ha expirado
        links.forEach(async (link) => {
            await checkAndExpireLink(link);
        });

    } catch (error) {
        console.error('Error al validar expiraciones:', error);
    }
});
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

router.get('/url/:id', verifyToken, async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        if (!link) {
            return res.status(404).json({ message: 'Enlace no encontrado' });
        }
        res.status(200).json(link);
    } catch (err) {
        console.error('Error al obtener el enlace:', err);
        res.status(500).json({ message: 'Error al obtener el enlace', error: err.message });
    }
});
router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const fileId = req.params.id;
        const link = await Link.findById(fileId);
        if (!link) {
            return res.status(404).json({ message: 'Enlace no encontrado' });
        }
        link.description = req.body.description || link.description;
        link.name = req.body.name || link.name;
        link.url = req.body.url || link.url;
        console.log(req.body.name)
        if (req.body.hoursToExpire && req.body.hoursToExpire > 0) {
            const now = new Date();
            const timezoneOffset = now.getTimezoneOffset(); // En minutos
            // Ajustar la fecha para obtener la hora local
            link.expirationTime = new Date(now.getTime() + (req.body.hoursToExpire * 60 * 60 * 1000) - (timezoneOffset * 60 * 1000));
            link.hoursToExpire = req.body.hoursToExpire;
            link.expire = false
        }
        await link.save();
        res.status(200).json(link);
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar el enlace', error: err.message });
    }
});
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const link = await Link.findByIdAndDelete(req.params.id);
        if (link) {
            return res.status(200).json({ message: 'Eliminado correctamente' });
        }
        if (!link) {
            return res.status(404).json({ message: 'Enlace no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el enlace', error: err.message });
    }
});
router.post('/upload', verifyToken, async (req, res) => {
    try {
        const { user, machine, description, hoursToExpire, url, name } = req.body;

        if (!user || !machine) {
            return res.status(400).json({ message: 'Los campos "usuario" y "máquina" son requeridos.' });
        }

        // Crea el nuevo enlace o enlace
        const linkData = {
            user: user,
            machine: machine,
            description: description,
            url: url,
            name: name,
        };

        if (hoursToExpire && hoursToExpire > 0) {
            const now = new Date();
            const timezoneOffset = now.getTimezoneOffset(); // En minutos

            // Ajustar la fecha para obtener la hora local
            linkData.expirationTime = new Date(now.getTime() + (hoursToExpire * 60 * 60 * 1000) - (timezoneOffset * 60 * 1000));
            linkData.hoursToExpire = hoursToExpire;
        }

        const newLink = new Link(linkData);
        await newLink.save();

        res.status(201).json(newLink);
    } catch (err) {
        res.status(500).json({ message: 'Error al subir el enlace o guardar el enlace', error: err.message });
    }
});

router.get('/search', verifyToken, async (req, res) => {
    try {
        const { name, createdAt } = req.query;
        const machine = Number(req.query.machine);
        const filters = {};
        if (machine) filters.machine = machine;
        if (name) filters.name = new RegExp(name, 'i');
        if (createdAt) filters.createdAt = createdAt;
        const links = await Link.find(filters).sort({ createdAt: -1 }).exec();

        return res.status(200).json(links);
    } catch (err) {
        return res.status(500).json({ message: 'Error al obtener enlaces', error: err.message });
    }
});
router.get('/:machine', verifyToken, async (req, res) => {
    try {
        const machineId = req.params.machine;

        const links = await Link.find({ machine: machineId }).sort({ createdAt: -1 });

        if (!links || links.length === 0) {
            return res.status(404).json({ message: 'No hay enlaces por ahora' });
        }

        return res.status(200).json(links);
    } catch (err) {
        console.error('Error al obtener los enlaces:', err);
        return res.status(500).json({ message: 'Error al obtener el enlace', error: err.message });
    }
});
router.get('/', verifyToken, async (req, res) => {
    try {
        const links = await Link.find().sort({ createdAt: -1 });
        res.status(200).json(links);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener enlaces', error: err.message });
    }
});
module.exports = router;
