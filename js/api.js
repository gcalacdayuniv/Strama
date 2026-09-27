// Ensure this base URL strictly matches your worker's domain and includes the /api prefix without a trailing slash
const API_URL = 'https://strama-api.plv.workers.dev/api'; 

export async function request(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('strama_token');
    const headers = { 'Content-Type': 'application/json' };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };
    if (body) {
        config.body = JSON.stringify(body);
    }

    // Sanitize endpoint to prevent double slashes (e.g., //register)
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const response = await fetch(`${API_URL}${cleanEndpoint}`, config);
    
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `API Request Failed (${response.status})` }));
        throw new Error(err.error || 'API Request Failed');
    }
    
    return response.json();
}
