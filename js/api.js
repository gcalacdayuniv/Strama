const API_URL = 'https://strama-api.plv.workers.dev/'; // Replace with your edge domain

export async function request(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('strama_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${API_URL}${endpoint}`, config);
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'API Request Failed');
    }
    return response.json();
}
