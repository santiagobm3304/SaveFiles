async function fetchData(url, options = {}) {
    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['x-access-token'] = token;
    } else {
        window.location.href = "/login";
        return;
    }

    const response = await fetch(url, {
        ...options,
        headers: headers
    });

    return response;
}
document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');
    const machine = sessionStorage.getItem('machine');
    const rol = sessionStorage.getItem('rol');
    const user = sessionStorage.getItem('id');
    if (rol != 1) {
        window.location.href = `/client/${user}/inicio`;
        return;
    }
    if (!token) {
        window.location.href = "/login";
        return;
    }

    if (machine) {
        sessionStorage.removeItem('machine');
    }
    
});

function navigateToFiles(machineId) {

    sessionStorage.setItem('machine', machineId); // Guardar la máquina seleccionada en sessionStorage
    window.location.href = `/files/index?machine=${machineId}`;
}

function navigateToLinks(machineId) {
    sessionStorage.setItem('machine', machineId); // Guardar la máquina seleccionada en sessionStorage
    window.location.href = `/links/index?machine=${machineId}`;
}
function logout() {
    sessionStorage.clear();
    window.location.href= "/login"
}