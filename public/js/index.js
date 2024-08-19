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



document.addEventListener('DOMContentLoaded', async () => {
    try { 
        const response = await fetchData('/api/files', { method: 'GET' });
        const files = await response.json();
        if(response.ok){
            renderTable(files);
        }else{
        errorMessage.textContent = files.message ;
        }

        
    } catch (error) {
        console.error('Error al cargar los archivos:', error);
        errorMessage.textContent = 'Error al cargar los archivos';
    }
});
// Filtrar archivos
document.getElementById('filterForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const filename = document.getElementById('filenameFilter').value;
    const mimetype = document.getElementById('mimetypeFilter').value;
    const createdAt = document.getElementById('dateFilter').value;

    const queryParams = new URLSearchParams({
        filename: filename,
        mimetype: mimetype,
        createdAt: createdAt
    });

    try {
        const response = await fetchData(`/api/files/search?${queryParams}`);
        const filteredFiles = await response.json();
        renderTable(filteredFiles);
    } catch (error) {
        console.error('Error al filtrar los archivos:', error);
        errorMessage.textContent = 'Error de conexión. Por favor, inténtalo de nuevo.';

    }
});



async function deleteFile(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
        try {
            await fetchData(`/api/files/${id}`, { method: 'DELETE' });
            location.reload(); // Recargar la página después de eliminar el archivo
        } catch (error) {
            console.error('Error al eliminar el archivo:', error);
        }
    }
}

function renderTable(data) {
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = ''; // Limpiar la tabla antes de llenarla

    if (data.length === 0) {
        filesList.innerHTML = '<tr><td colspan="4">No se encontraron archivos.</td></tr>';
    } else {
        data.forEach(file => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${file.filename}</td>
                <td>${file.mimetype}</td>
                <td>${file.createdAt}</td>
                <td>
                    <button class="download" onclick="window.location.href='/api/files/download/${file._id}'">Descargar</button>
                    <button class="edit" onclick="window.location.href='/update?id=${file._id}'">Editar</button>
                    <button class="delete" onclick="deleteFile('${file._id}')">Eliminar</button>
                </td>
            `;

            filesList.appendChild(row);
        });
    }
}   
// Maneja el clic en el botón de cerrar sesión
document.getElementById('logoutButton').addEventListener('click', () => {
    // Elimina el token de la sesión
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('name');
    
    // Redirige al usuario a la página de inicio de sesión
    location.reload();
});
