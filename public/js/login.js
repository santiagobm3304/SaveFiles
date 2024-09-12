if (sessionStorage.getItem('token') != undefined) {
    window.location.href = "/machines";
}
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

document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetchData('/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ correo: email, clave: password })
        });

        const result = await response.json();
        if (response.ok) {
            sessionStorage.setItem('name', result.data.user.name);
            sessionStorage.setItem('token', result.data.token);
            window.location.href = '/machines';
        } else {
            errorMessage.textContent = result.message || 'Error al iniciar sesión';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'Error de conexión. Por favor, inténtalo de nuevo.';
    }
});
 