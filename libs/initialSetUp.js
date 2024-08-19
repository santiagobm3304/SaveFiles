
const { createNewUsuario } = require('../routes/UserRoute')
const User = require("../models/UserModel.js");

const createAdmin = async () => {
    const count = await User.estimatedDocumentCount();

    if (count > 0) return;
    
    const usuario = new User({
        nombre: "Kevin",
        correo: "kevin.arenas@tecsup.edu.pe",
        clave: "kevinarenas24"
    });
    await createNewUsuario(usuario);

};

createAdmin();