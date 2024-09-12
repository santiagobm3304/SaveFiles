async function fetchData(url, options = {}) {
    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['x-access-token'] = token;
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

    if (!token) {
        window.location.href = "/login";
        return;
    }

    if (machine) {
        sessionStorage.removeItem('machine');
    }
});

function selectMachine(machineId) {
    sessionStorage.setItem('machine', machineId);
}

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('name');
    window.location.href= "/login"
}