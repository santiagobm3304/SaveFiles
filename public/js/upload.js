document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');
    const machine = sessionStorage.getItem('machine');

    if (!token) {
        window.location.href = "/login";
        return;
    }
    if (!machine) {
        alert("No se ha proporcionado una Máquina para ver sus archivos.");
        window.location.href = "/machines";
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
            // Si la respuesta no es OK, intenta leer el error como JSON
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
    event.preventDefault();

    const formData = new FormData(event.target);
    formData.append('user', sessionStorage.getItem('name'));
    formData.append('machine', sessionStorage.getItem('machine'));

    try {
        const result = await fetchData('/api/files/upload', {
            method: 'POST',
            body: formData
        });

        alert('Archivo subido exitosamente!');
        window.location.href = "/index?id=" + sessionStorage.getItem('machine');
    } catch (error) {
        alert('Error al subir el archivo: ' + error.message);
        console.error('Error:', error);
    }
});

document.getElementById('cancelButton').addEventListener('click', () => {
    window.location.href = "/index?id=" + sessionStorage.getItem('machine');
});
