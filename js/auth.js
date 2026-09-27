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
        
        if (isLoginMode) {
            document.getElementById('login-fields').classList.remove('hidden');
            document.getElementById('register-fields').classList.add('hidden');
            document.getElementById('auth-identifier').required = true;
            document.getElementById('auth-reg-username').required = false;
            document.getElementById('auth-reg-email').required = false;
            document.getElementById('auth-reg-phone').required = false;
        } else {
            document.getElementById('login-fields').classList.add('hidden');
            document.getElementById('register-fields').classList.remove('hidden');
            document.getElementById('auth-identifier').required = false;
            document.getElementById('auth-reg-username').required = true;
            document.getElementById('auth-reg-email').required = true;
            document.getElementById('auth-reg-phone').required = true;
        }
    };

    document.getElementById('auth-form').onsubmit = async (e) => {
        e.preventDefault();
        const password = document.getElementById('auth-password').value;

        try {
            if (isLoginMode) {
                const identifier = document.getElementById('auth-identifier').value;
                const res = await request('/login', 'POST', { identifier, password });
                
                localStorage.setItem('strama_token', res.token);
                showScreen('dashboard-screen');
                loadProjectsCallback();
            } else {
                const username = document.getElementById('auth-reg-username').value;
                const email = document.getElementById('auth-reg-email').value;
                const phone_number = document.getElementById('auth-reg-phone').value;

                await request('/register', 'POST', { username, email, phone_number, password });
                alert('Registration successful! Your account is currently inactive. Please wait for an admin to activate it.');
                
                // Automatically switch back to login mode
                isLoginMode = true;
                document.getElementById('auth-title').innerText = 'Login';
                document.getElementById('login-fields').classList.remove('hidden');
                document.getElementById('register-fields').classList.add('hidden');
                document.getElementById('auth-identifier').required = true;
                document.getElementById('auth-reg-username').required = false;
                document.getElementById('auth-reg-email').required = false;
                document.getElementById('auth-reg-phone').required = false;
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
