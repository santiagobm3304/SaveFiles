const token = sessionStorage.getItem('token')
if (token == undefined) {
    window.location.href="/login";
}
async function fetchData(url, options = {}) {
    const headers = {
        ...options.headers
    };

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


document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    formData.append('user', sessionStorage.getItem('name'));

    try {
        const response = await fetchData('/api/files/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            alert('Archivo subido exitosamente!');
            window.location.href = '/home';
        } else {
            const error = await response.json();
            alert('Error al subir el archivo: ' + error.message);
            console.error('Error:', error);
        }
    } catch (error) {
        alert('Error al subir el archivo: ' + error.message);
        console.error('Error:', error);
    }
});
document.getElementById('cancelButton').addEventListener('click', () => {
    window.location.href = '/home'; // Redirige a la página de inicio
});