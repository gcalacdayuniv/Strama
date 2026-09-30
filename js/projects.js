import { request } from './api.js';
import { state } from './state.js';
import { loadProjectIntoEditor } from './plotter.js';

export async function loadProjects() {
    try {
        const projects = await request('/projects', 'GET');
        const list = document.getElementById('project-list');
        list.innerHTML = '';
        projects.forEach(p => {
            const div = document.createElement('div');
            div.className = 'bg-white p-4 rounded shadow flex justify-between items-center';
            div.innerHTML = `
                <div><h3 class="font-bold">${p.name}</h3><p class="text-xs text-gray-500">Updated: ${new Date(p.updated_at).toLocaleString()}</p></div>
                <div class="flex gap-2">
                    <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onclick="window.openProject('${p.id}')">Open</button>
                    <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onclick="window.deleteProject('${p.id}')">Delete</button>
                </div>
            `;
            list.appendChild(div);
        });
    } catch (e) {
        alert(e.message);
    }
}

export async function createProject(name) {
    if (!name) return alert('Project name required');
    try {
        await request('/projects', 'POST', { name });
        await loadProjects();
        document.getElementById('new-project-name').value = '';
    } catch (e) {
        alert(e.message);
    }
}

export async function openProject(id) {
    try {
        const project = await request(`/projects/${id}`, 'GET');
        state.currentProjectId = project.id;
        document.getElementById('editor-project-title').innerText = project.name;
        loadProjectIntoEditor(project);

        document.getElementById('dashboard-screen').classList.add('hidden');
        document.getElementById('editor-screen').classList.remove('hidden');
    } catch (e) {
        alert(e.message);
    }
}

export async function deleteProject(id) {
    if (!confirm("Are you sure?")) return;
    try {
        await request(`/projects/${id}`, 'DELETE');
        await loadProjects();
    } catch (e) {
        alert(e.message);
    }
}
