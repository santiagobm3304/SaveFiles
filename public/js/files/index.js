async function fetchData(url, options = {}, responseType = 'json') {
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

        // Si se espera un archivo, devolver como Blob
        if (responseType === 'blob') {
            return await response.blob();
        }

        // Si no, retornar como JSON
        return await response.json();
    } catch (error) {
        console.error('Error en fetchData:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('token');
    const rol = sessionStorage.getItem('rol');
    const user = sessionStorage.getItem('id');
    const machine = sessionStorage.getItem('machine');
    if (rol != 1) {
        window.location.href = `/client/${user}/inicio`;
        return;
    }
    if (!token) {
        alert("Necesita estar logeado");
        window.location.href = "/login";
        return;
    }

    if (!machine) {
        alert("No se ha proporcionado una Máquina para ver sus archivos.");
        window.location.href = "/machines";
        return;
    }

    try {
        const files = await fetchData(`/api/files/${machine}`, { method: 'GET' }); // Usar machine ID en la URL
        renderTable(files);
    } catch (error) {
        console.error('Error al cargar los archivos:', error);
        const errorLoad = document.getElementById('errorLoad');
        if (errorLoad) {
            errorLoad.textContent = error.message;
        } else {
            alert(error.message); // Muestra una alerta si no existe el elemento de mensaje de error
        }
    }
});


// Filtrar archivos
document.getElementById('filterForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const filename = document.getElementById('filenameFilter').value;
    const mimetype = document.getElementById('mimetypeFilter').value;
    const createdAt = document.getElementById('dateFilter').value;
    const machine = sessionStorage.getItem('machine'); // Obtener la máquina de sessionStorage
    const queryParams = new URLSearchParams({
        filename: filename,
        mimetype: mimetype,
        createdAt: createdAt,
        machine: machine // Añadir la máquina a los parámetros
    });

    try {
        const filteredFiles = await fetchData(`/api/files/search?${queryParams}`);
        renderTable(filteredFiles);
    } catch (error) {
        console.error('Error al filtrar los archivos:', error);
        const errorLoad = document.getElementById('errorLoad');
        if (errorLoad) {
            errorLoad.textContent = 'Error de conexión. Por favor, inténtalo de nuevo.';
        } else {
            alert('Error de conexión. Por favor, inténtalo de nuevo.'); // Muestra una alerta si no existe el elemento de mensaje de error
        }
    }
});




async function deleteFile(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
        try {
            await fetchData(`/api/files/${id}`, { method: 'DELETE' });
            location.reload();
            return
        } catch (error) {
            console.error('Error al eliminar el archivo:', error);
        }
    }
}

function renderTable(data) {
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = '';
    console.log(data)
    if (data.length === 0) {
        filesList.innerHTML = '<tr><td colspan="4" style="text-align: center;">No se encontraron archivos.</td></tr>';
    } else {
        data.forEach(file => {
            const row = document.createElement('tr');
            if (file.mimetype === 'url' && file.expire == true) {
                row.innerHTML = `
                <td>${file.originalname}</td>
                <td>${file.mimetype}</td>
                <td>${file.user}</td>
                <td>${file.createdAt}</td>
                <td>
                    <button class="download" onclick="window.open('${file.path}', '_blank')" disabled><i class="fa-regular fa-eye"></i></button>
                    <button class="edit" onclick="window.location.href='/update?id=${file._id}'"><i class="fa-regular fa-pen-to-square"></i></button>
                    <button class="delete" onclick="deleteFile('${file._id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            } else if (file.mimetype === 'url') {
                row.innerHTML = `
                <td>${file.originalname}</td>
                <td>${file.mimetype}</td>
                <td>${file.user}</td>
                <td>${file.createdAt}</td>
                <td>
                    <button class="download" onclick="window.open('${file.path}', '_blank')"><i class="fa-regular fa-eye"></i></button>
                    <button class="edit" onclick="window.location.href='/update?id=${file._id}'" ><i class="fa-regular fa-pen-to-square"></i></button>
                    <button class="delete" onclick="deleteFile('${file._id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            } else {
                row.innerHTML = `
                <td>${file.originalname}</td>
                <td>${file.mimetype}</td>
                <td>${file.user}</td>
                <td>${file.createdAt}</td>
                <td>
                    <button class="download" onclick="download('${file._id}', '${file.filename}')"><i class="fa-solid fa-download"></i></button>
                    <button class="edit" onclick="window.location.href='/files/update?id=${file._id}'"><i class="fa-regular fa-pen-to-square"></i></button>
                    <button class="delete" onclick="deleteFile('${file._id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            }

            filesList.appendChild(row);
        });
    }
}
async function download(id, filename) {
    try {
        const blob = await fetchData(`/api/files/download/${id}?filename=`, { method: 'GET' }, 'blob');

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // O usa el nombre real del archivo aquí
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al descargar el archivo:', error);
        alert('Error al descargar el archivo: ' + error.message);
    }
}

function goToHome() {
    sessionStorage.removeItem('machine');
    window.location.href = "/machines"
}

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('name');
    window.location.href = "/login"
}

function upload() {
    window.location.href = "/files/upload"
}
function getExcelLink() {
    const machine = sessionStorage.getItem('machine');
    const excelLinks = [
        { "id": 1, "link": "https://docs.google.com/spreadsheets/d/1_njzaITBNQXO53YBZuFu_0bQp80MjIwZH5BwY5s07_s/edit?gid=0#gid=0" },
        { "id": 2, "link": "https://docs.google.com/spreadsheets/d/13_Dv1d1xg07u0lBDJrcRB1BT41kT9AFk9KTO3rUwnqE/edit?gid=0#gid=0" },
        { "id": 3, "link": "https://docs.google.com/spreadsheets/d/1TewNR3C9edbD-nVPZyyTAe_XOqFPMiRP46i0iyDA7UU/edit?gid=0#gid=0" },
        { "id": 4, "link": "https://docs.google.com/spreadsheets/d/1qRFOLlmcRzqBJaXPCYvJwnDpZBKkzRsjZq6ao2pYFes/edit?gid=0#gid=0" }
    ];

    const excelLink = excelLinks.find(item => item.id === Number(machine));

    if (excelLink) {
        window.open(excelLink.link, '_blank');
    } else {
        alert("No se encontró un enlace para la máquina especificada.");
    }
}
