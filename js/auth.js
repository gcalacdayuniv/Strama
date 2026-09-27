import { request } from './api.js';

let isLoginMode = true;

export function initAuth(showScreen, loadProjectsCallback) {
    const token = localStorage.getItem('strama_token');
    if (token) {
        showScreen('dashboard-screen');
        loadProjectsCallback();
    } else {
        showScreen('auth-screen');
    }

    document.getElementById('auth-toggle').onclick = (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        document.getElementById('auth-title').innerText = isLoginMode ? 'Login' : 'Register';
    };

    document.getElementById('auth-form').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        try {
            if (isLoginMode) {
                const res = await request('/login', 'POST', { email, password });
                localStorage.setItem('strama_token', res.token);
                showScreen('dashboard-screen');
                loadProjectsCallback();
            } else {
                await request('/register', 'POST', { email, password });
                alert('Registered! You can now log in.');
                isLoginMode = true;
                document.getElementById('auth-title').innerText = 'Login';
            }
        } catch (err) {
            alert(err.message);
        }
    };

    document.getElementById('btn-logout').onclick = () => {
        localStorage.removeItem('strama_token');
        showScreen('auth-screen');
    };
}
