import * as Auth from './auth.js';
import * as Projects from './projects.js';
import * as Plotter from './plotter.js';

const showScreen = (id) => {
    ['auth-screen', 'dashboard-screen', 'editor-screen'].forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
};

window.switchEditorView = (viewId) => {
    document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('#editor-screen button[id^="nav-"]').forEach(btn => btn.classList.replace('bg-white', 'hover:bg-blue-700'));
    document.querySelectorAll('#editor-screen button[id^="nav-"]').forEach(btn => btn.classList.remove('text-blue-600', 'text-gray-800'));
    
    document.getElementById(`view-${viewId}`).classList.add('active');
    const navBtn = document.getElementById(`nav-${viewId}`);
    navBtn.classList.replace('hover:bg-blue-700', 'bg-white');
    navBtn.classList.add('text-blue-600');
};

document.getElementById('nav-entities').onclick = () => switchEditorView('entities');
document.getElementById('nav-ge').onclick = () => switchEditorView('ge');
document.getElementById('nav-gs').onclick = () => switchEditorView('gs');
document.getElementById('nav-space').onclick = () => switchEditorView('space');
document.getElementById('nav-sm').onclick = () => switchEditorView('sm');
document.getElementById('nav-porters').onclick = () => switchEditorView('porters');

document.getElementById('btn-back-dashboard').onclick = () => {
    Projects.loadProjects();
    showScreen('dashboard-screen');
};

document.getElementById('btn-save-project').onclick = Plotter.saveCurrentProject;
document.getElementById('btn-create-project').onclick = () => Projects.createProject(document.getElementById('new-project-name').value);

Auth.initAuth(showScreen, Projects.loadProjects);

window.openProject = Projects.openProject;
window.deleteProject = Projects.deleteProject;
