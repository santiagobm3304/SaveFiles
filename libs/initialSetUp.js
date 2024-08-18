
const { createNewUsuario } = require('../routes/UserRoute')
const User = require("../models/UserModel.js");

const createAdmin = async () => {
    const count = await User.estimatedDocumentCount();

    if (count > 0) return;
    
    const usuario = new User({
        nombre: "Antonio",
        correo: "antonio@savefiles.com",
        clave: "savefiles123"
    });
    await createNewUsuario(usuario);

};

createAdmin();