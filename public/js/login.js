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
            sessionStorage.setItem('id', result.data.user.id);
            sessionStorage.setItem('rol', result.data.user.rol );
            sessionStorage.setItem('token', result.data.token);
            const user = sessionStorage.getItem('id');
            if(sessionStorage.getItem('rol')==1) {
                window.location.href = '/machines';
                return;
            } else{
                window.location.href = `/client/${user}/inicio`;
                return;
            }
        } else {
            errorMessage.textContent = result.message || 'Error al iniciar sesión';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'Error de conexión. Por favor, inténtalo de nuevo.';
    }
});
 