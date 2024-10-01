document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');
    const rol = sessionStorage.getItem('rol');
    const user = sessionStorage.getItem('id');
    const machine = sessionStorage.getItem('machine');
    if (rol != 1) {
        window.location.href = `/client/${user}/inicio`;
        return;
    }
    if (!token) {
        window.location.href = "/login";
        return;
    }
    if (!machine) {
        alert("No se ha proporcionado una Máquina para ver sus archivos.");
        window.location.href = "/machines";
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
    event.preventDefault(); // Evita el envío tradicional del formulario

    const formData = new FormData(event.target); // Captura los datos del formulario
    const machine = sessionStorage.getItem('machine');
    const user = sessionStorage.getItem('name');

    // Verifica si hay un enlace ingresado
    const url = formData.get('url');
    if (!url) {
        alert("Debe proporcionar un enlace.");
        return;
    }

    try {

        const data = {
            user: user,
            machine: machine,
            url: formData.get('url'),
            name: formData.get('name'),
            description: formData.get('description'),
            hoursToExpire: formData.get('hoursToExpire')
        };

        const response = await fetchData('/api/links/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // si es necesario
            },
            body: JSON.stringify(data)
        });


        alert('Enlace subido exitosamente!');
        window.location.href = "/links/index?id=" + sessionStorage.getItem('machine');

    } catch (error) {
        alert('Error al subir el enlace: ' + error.message);
        console.error('Error:', error);
    }
});


// Si se cancela, redirige a la lista de archivos
document.getElementById('cancelButton').addEventListener('click', () => {
    window.location.href = "/links/index?id=" + sessionStorage.getItem('machine');
});
