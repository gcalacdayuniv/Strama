export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        };

        if (method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // AUTH: Register
            if (path === '/api/register' && method === 'POST') {
                const { email, password } = await request.json();
                if (!email || !password) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: corsHeaders });
                
                const userId = crypto.randomUUID();
                await env.DB.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)')
                    .bind(userId, email, password).run();
                return new Response(JSON.stringify({ message: 'User created' }), { headers: corsHeaders });
            }

            // AUTH: Login
            if (path === '/api/login' && method === 'POST') {
                const { email, password } = await request.json();
                const user = await env.DB.prepare('SELECT id FROM users WHERE email = ? AND password_hash = ?')
                    .bind(email, password).first();
                
                if (!user) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: corsHeaders });
                
                const token = crypto.randomUUID();
                const expiresAt = new Date(Date.now() + 86400000).toISOString(); // 1 day
                await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
                    .bind(token, user.id, expiresAt).run();
                
                return new Response(JSON.stringify({ token, userId: user.id }), { headers: corsHeaders });
            }

            // MIDDLEWARE: Validate Session
            const authHeader = request.headers.get('Authorization');
            const token = authHeader ? authHeader.split(' ')[1] : null;
            if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
            
            const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP')
                .bind(token).first();
            if (!session) return new Response(JSON.stringify({ error: 'Invalid or expired session' }), { status: 401, headers: corsHeaders });
            
            const userId = session.user_id;

            // PROJECTS: Get All
            if (path === '/api/projects' && method === 'GET') {
                const { results } = await env.DB.prepare('SELECT id, name, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
                    .bind(userId).all();
                return new Response(JSON.stringify(results), { headers: corsHeaders });
            }

            // PROJECTS: Create New
            if (path === '/api/projects' && method === 'POST') {
                const { name } = await request.json();
                const projectId = crypto.randomUUID();
                await env.DB.prepare('INSERT INTO projects (id, user_id, name) VALUES (?, ?, ?)')
                    .bind(projectId, userId, name).run();
                return new Response(JSON.stringify({ id: projectId, name }), { headers: corsHeaders });
            }

            // PROJECTS: Get Specific Project
            if (path.startsWith('/api/projects/') && method === 'GET') {
                const projectId = path.split('/').pop();
                const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
                    .bind(projectId, userId).first();
                if (!project) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
                return new Response(JSON.stringify(project), { headers: corsHeaders });
            }

            // PROJECTS: Update Data
            if (path.startsWith('/api/projects/') && method === 'PUT') {
                const projectId = path.split('/').pop();
                const { name, ge_data, gs_data, space_data, sm_data, porters_data } = await request.json();
                
                await env.DB.prepare(
                    `UPDATE projects SET name = ?, ge_data = ?, gs_data = ?, space_data = ?, sm_data = ?, porters_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
                ).bind(
                    name, 
                    JSON.stringify(ge_data), 
                    JSON.stringify(gs_data), 
                    JSON.stringify(space_data), 
                    JSON.stringify(sm_data), 
                    JSON.stringify(porters_data), 
                    projectId, 
                    userId
                ).run();
                return new Response(JSON.stringify({ message: 'Saved successfully' }), { headers: corsHeaders });
            }

            // PROJECTS: Delete
            if (path.startsWith('/api/projects/') && method === 'DELETE') {
                const projectId = path.split('/').pop();
                await env.DB.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').bind(projectId, userId).run();
                return new Response(JSON.stringify({ message: 'Deleted' }), { headers: corsHeaders });
            }

            return new Response(JSON.stringify({ error: 'Route not found' }), { status: 404, headers: corsHeaders });

        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
        }
    }
};
