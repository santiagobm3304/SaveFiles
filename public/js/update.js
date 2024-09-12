
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
            const error = await response.json();
            throw new Error(error.message || 'Error en la solicitud');
        }

        return response;
    } catch (error) {
        console.error('Error en fetchData:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('token');
    const machine = sessionStorage.getItem('machine');
    const fileId = new URLSearchParams(window.location.search).get('id');

    if (!token) {
        alert("Necesita estar logeado");
        window.location.href = "/login";
        return;
    }
    if (!machine) {
        alert("No se ha proporcionado una Máquina para ver sus archivos.");
        window.location.href = "/machines";
        return
    }
    if (!fileId) {
        alert('No se ha proporcionado un ID de archivo.');
        window.location.href = "/index?id=" + machine;
        return;
    }

    try {
        const response = await fetchData(`/api/files/file/${fileId}`, { method: 'GET' });
        if (!response.ok) {
            throw new Error('Error al obtener el archivo');
        }
        
        const file = await response.json();

        document.getElementById('fileId').value = file._id;
        document.getElementById('currentFilename').value = file.filename;
        document.getElementById('currentSize').value = `${file.size} bytes`;
        document.getElementById('currentDescription').value = file.description || 'No disponible';
        document.getElementById('currentMimetype').value = file.mimetype;
        document.getElementById('currentUser').value = file.user || 'No disponible';
    } catch (error) {
        console.error('Error al cargar los datos del archivo:', error);
        alert('Error al cargar los datos del archivo.');
    }
});
document.getElementById('updateForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Obtiene los datos del formulario
    const formData = new FormData(event.target);
    const fileId = document.getElementById('fileId').value;

    try {
        // Envía la solicitud de actualización
        const response = await fetchData(`/api/files/update/${fileId}`, {
            method: 'PUT',
            body: formData
        });

        // Verifica la respuesta
        if (response.ok) {
            const result = await response.json();
            alert('Archivo actualizado exitosamente!');
            window.location.href = "/index?id=" + sessionStorage.getItem('machine'); // Redirige a la página de inicio
        } else {
            const error = await response.json();
            alert('Error al actualizar el archivo: ' + error.message);
            console.error('Error:', error);
        }
    } catch (error) {
        alert('Error al actualizar el archivo: ' + error.message);
        console.error('Error:', error);
    }
});

document.getElementById('cancelButton').addEventListener('click', () => {
    window.location.href = "/index?id=" + sessionStorage.getItem('machine'); // Redirige a la página de inicio
});