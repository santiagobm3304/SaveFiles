const { createNewUsuario } = require('../routes/UserRoute');
const User = require("../models/UserModel.js");

const createAdmin = async () => {
    const count = await User.find();

    if (count.length > 0) return;
    
    const usuario = new User({
        nombre: "Kevin",
        rol: 1,
        correo: "kevin.arenas@tecsup.edu.pe",
        clave: "kevinarenas24"
    });
    const usuario1 = new User({
        nombre: "usuario1",
        rol: 2,
        correo: "usuariodeprueba1@gmail.com",
        clave: "usuario123"
    });
    const usuario2 = new User({
        nombre: "usuario2",
        rol: 2,
        correo: "usuariodeprueba2@gmail.com",
        clave: "usuario123"
    });
    await createNewUsuario(usuario);
    await createNewUsuario(usuario1);
    await createNewUsuario(usuario2);

};

createAdmin();