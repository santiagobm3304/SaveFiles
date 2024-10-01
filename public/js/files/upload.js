document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');

    if (!token) {
        window.location.href = "/login";
        return;
    }
});

async function fetchData(url, options = {}) {
    const headers = {
        ...options.headers
    };

    const token = sessionStorage.getItem('token');
    if (token) {
        headers['x-access-token'] = token;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: headers
        });

        if (!response.ok) {
            let error = { message: 'Error en la solicitud' };
            try {
                error = await response.json();
            } catch (jsonError) {
                console.error('Error al analizar JSON:', jsonError);
            }
            throw new Error(error.message || 'Error en la solicitud');
        }

        return response.json();
    } catch (error) {
        console.error('Error en fetchData:', error);
        throw error;
    }
}

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de manera tradicional

    const formData = new FormData(event.target); // Crea un FormData a partir del formulario
    const fileInput = document.getElementById('file');
    const machine = sessionStorage.getItem('machine');
    const user = sessionStorage.getItem('name');
    // Verificar si se envió un archivo o un enlace, pero no ambos
    const file = fileInput.files[0];

    if (!file) {
        alert("Debe proporcionar un archivo.");
        return;
    }
    // Agregar los datos adicionales al FormData
    formData.append('user', user);
    formData.append('machine', machine);
    try {

        // Llamada a la API de subida de archivos/enlaces
        const result = await fetchData('/api/files/upload', {
            method: 'POST',
            body: formData
        });

        alert('Archivo subido exitosamente!');
        window.location.href = "/files/index?id=" + sessionStorage.getItem('machine'); // Redirige a la lista de archivos
    } catch (error) {
        alert('Error al subir el archivo: ' + error.message);
        console.error('Error:', error);
    }
});

// Si se cancela, redirige a la lista de archivos
document.getElementById('cancelButton').addEventListener('click', () => {
    window.location.href = "/files/index?id=" + sessionStorage.getItem('machine');
});
