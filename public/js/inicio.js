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
    const machine = sessionStorage.getItem('machine');
    if (machine) sessionStorage.removeItem('machine');

    if (!token) {
        alert("Necesita estar logeado");
        window.location.href = "/login";
        return;
    }


    try {
        const files = await fetchData(`/api/links/`, { method: 'GET' }); // Usar machine ID en la URL
        renderTable(files);
    } catch (error) {
        console.error('Error al cargar los enalces:', error);
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
    const name = document.getElementById('filenameFilter').value;
    const createdAt = document.getElementById('dateFilter').value;
    const machine = document.getElementById('machineFilter').value; // Obtener la máquina de sessionStorage
    const queryParams = new URLSearchParams({
        name: name,
        createdAt: createdAt,
        machine: machine
    });

    try {
        const filteredFiles = await fetchData(`/api/links/search?${queryParams}`);
        renderTable(filteredFiles);
    } catch (error) {
        console.error('Error al filtrar los enlaces:', error);
        const errorLoad = document.getElementById('errorLoad');
        if (errorLoad) {
            errorLoad.textContent = 'Error de conexión. Por favor, inténtalo de nuevo.';
        } else {
            alert('Error de conexión. Por favor, inténtalo de nuevo.'); // Muestra una alerta si no existe el elemento de mensaje de error
        }
    }
});
function startCountdown(expirationTime, countdownId) {
    console.log(countdownId)
    // Verificar que la fecha de expiración sea válida
    if (!expirationTime || isNaN(new Date(expirationTime).getTime())) {
        document.getElementById(countdownId).innerText = 'Sin fecha de expiración';
        return;
    }

    // Actualizar el contador cada segundo
    const timer = setInterval(() => {
        const currentTime = new Date();
        const localtime = new Date(currentTime - currentTime.getTimezoneOffset() * 60 * 1000);
        const expirationDate = new Date(expirationTime);

        const timeDifference = expirationDate - localtime;

        if (timeDifference <= 0) {
            document.getElementById(countdownId).innerText = 'El archivo ha expirado';
            clearInterval(timer);  // Detenemos el temporizador si el archivo ha expirado
            return;
        }

        // Convertir la diferencia de tiempo a días, horas, minutos y segundos
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        // Mostrar el tiempo restante en el contador específico
        document.getElementById(countdownId).innerText = `Expira en: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}
function renderTable(data) {
    const filesList = document.getElementById('cards-container');
    filesList.innerHTML = '';
    if (data.length === 0) {
        filesList.innerHTML = '<tr><td colspan="4" style="text-align: center;">No se encontraron enlaces.</td></tr>';
    } else {
        data.forEach(file => {
            const row = document.createElement('div');
            const countdownId = `countdown-${file.name}`;
            if (file.expire == true) {
                row.innerHTML = `
                <div class="card disabled" id="myCard1">
            <div class="card-content">
                <div class="card-details">
                    <h3 id="cardName">${file.name}</h3>
                    <p id="cardDate">Fecha: ${file.createdAt}</p>
                    <p id="${countdownId}"><p>
                </div>
            </div>
            <div class="card-actions">
                <button class="action-btn view-btn" onclick="window.open('${file.url}', '_blank')" disabled>Ver</button>
                <button class="action-btn view-btn" onclick="upload(${file.machine})" disabled>Subir</button>
                
            </div>
        </div>
            `;

            } else {
                row.innerHTML = `
                <div class="card" id="myCard1">
            <div class="card-content">
                <div class="card-details">
                    <h3 id="cardName">${file.name}</h3>
                    <p id="cardDate">Fecha: ${file.createdAt}</p>
                    <p id="${countdownId}"><p>
                </div>
            </div>
            <div class="card-actions">
                <button class="action-btn view-btn" onclick="window.open('${file.url}', '_blank')">Ver</button>
                <button class="action-btn view-btn" onclick="upload(${file.machine})">Subir</button>
                </div>
        </div>
            `;

            }
            filesList.appendChild(row);
            startCountdown(file.expirationTime, countdownId);

        });
    }
}

function goToHome() {
    window.location.href = `/client/${user}/inicio`;
    return;
}

function logout() {
    sessionStorage.clear();
    window.location.href = "/login"
}

function upload(machineId) {
    sessionStorage.setItem('machine', machineId);
    window.location.href = "/files/upload"
}

function files() {
    const user = sessionStorage.getItem('id')
    window.location.href = `/client/${user}/files`;
    return;
}