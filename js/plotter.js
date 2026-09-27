import { request } from './api.js';
import { currentProjectId } from './projects.js';

let geData = [];
let gsData = [];
let smData = {
    mission: "", vision: "", objectives: [],
    colors: { mvBg: "#ffffff", mvColor: "#334155", finBg: "#1e293b", finColor: "#ffffff", cusBg: "#0d9488", cusColor: "#ffffff", intBg: "#7c3aed", intColor: "#ffffff", lrnBg: "#e11d48", lrnColor: "#ffffff" }
};
const defaultPorters = [
    { id: 'substitutes', title: 'Potential Development of<br>Substitute Products', rating: 'Moderate', bg: '#4bc89e', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h13.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H3.2"/></svg>' },
    { id: 'entrants', title: 'Potential Entry of<br>New Competitors', rating: 'Moderate', bg: '#2CC6D2', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>' },
    { id: 'suppliers', title: 'Bargaining Power<br>of Suppliers', rating: 'Moderate', bg: '#fbb321', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>' },
    { id: 'consumers', title: 'Bargaining Power<br>of Consumers', rating: 'Moderate', bg: '#0caae9', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' },
    { id: 'rivalry', title: 'Rivalry Among<br>Competing Firms', rating: 'Moderate', bg: '#fa7902', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 21l2-2"></path><path d="M9.5 6.5L21 18v3h-3L6.5 9.5"></path><path d="M5 11l6-6"></path><path d="M8 8L4 4"></path><path d="M5 3L3 5"></path></svg>' }
];
let portersData = JSON.parse(JSON.stringify(defaultPorters));

function hexToRgba(hex, alphaPercent) {
    if (!hex) return `rgba(255, 255, 255, ${alphaPercent / 100})`;
    hex = hex.replace(/^#/, '');
    if(hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = Math.max(0, Math.min(1, alphaPercent / 100)).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function loadProjectIntoEditor(project) {
    geData = project.ge_data ? JSON.parse(project.ge_data) : [];
    gsData = project.gs_data ? JSON.parse(project.gs_data) : [];
    smData = project.sm_data ? JSON.parse(project.sm_data) : { mission: "", vision: "", objectives: [], colors: { mvBg: "#ffffff", mvColor: "#334155", finBg: "#1e293b", finColor: "#ffffff", cusBg: "#0d9488", cusColor: "#ffffff", intBg: "#7c3aed", intColor: "#ffffff", lrnBg: "#e11d48", lrnColor: "#ffffff" }};
    portersData = project.porters_data ? JSON.parse(project.porters_data) : JSON.parse(JSON.stringify(defaultPorters));
    
    renderAll();
}

export async function saveCurrentProject() {
    try {
        const title = document.getElementById('editor-project-title').innerText;
        await request(`/projects/${currentProjectId}`, 'PUT', {
            name: title, ge_data: geData, gs_data: gsData, sm_data: smData, porters_data: portersData
        });
        alert('Project saved successfully');
    } catch (e) { alert(e.message); }
}

function renderAll() {
    buildGETable(); renderGEChart();
    buildGSTable(); renderGSChart();
    buildSMTable(); renderSMChart(); updateSMUI();
    buildPortersTable(); renderPortersChart();
}

/* --- GE MATRIX LOGIC --- */
function buildGETable() {
    const tbody = document.getElementById('ge-tbody'); tbody.innerHTML = '';
    if (!geData.length) { tbody.innerHTML = '<tr><td colspan="10">No SBUs added.</td></tr>'; return; }
    geData.forEach((sbu, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${sbu.name}" data-idx="${i}" data-field="name" class="ge-input"></td>
            <td><input type="number" min="1.0" max="5.0" step="0.01" value="${sbu.attr}" data-idx="${i}" data-field="attr" class="ge-input"></td>
            <td><input type="number" min="1.0" max="5.0" step="0.01" value="${sbu.comp}" data-idx="${i}" data-field="comp" class="ge-input"></td>
            <td><input type="number" min="10" max="100" value="${sbu.size}" data-idx="${i}" data-field="size" class="ge-input"></td>
            <td><input type="color" value="${sbu.color}" data-idx="${i}" data-field="color" class="ge-input"></td>
            <td><input type="number" min="0" max="100" value="${sbu.bubbleOpacity !== undefined ? sbu.bubbleOpacity : 100}" data-idx="${i}" data-field="bubbleOpacity" class="ge-input"></td>
            <td><select data-idx="${i}" data-field="pos" class="ge-input"><option value="top" ${sbu.pos==='top'?'selected':''}>Top</option><option value="bottom" ${sbu.pos==='bottom'?'selected':''}>Bot</option><option value="left" ${sbu.pos==='left'?'selected':''}>Left</option><option value="right" ${sbu.pos==='right'?'selected':''}>Right</option></select></td>
            <td><input type="color" value="${sbu.labelBgColor || '#ffffff'}" data-idx="${i}" data-field="labelBgColor" class="ge-input"></td>
            <td><input type="number" min="0" max="100" value="${sbu.labelBgOpacity !== undefined ? sbu.labelBgOpacity : 90}" data-idx="${i}" data-field="labelBgOpacity" class="ge-input"></td>
            <td><button class="btn-delete" data-idx="${i}">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}
function renderGEChart() {
    const plotArea = document.getElementById('ge-plot-area'); plotArea.innerHTML = '';
    geData.forEach((sbu) => {
        const el = document.createElement('div'); el.className = 'bubble'; el.style.width = (sbu.size / 700 * 100) + '%'; el.style.aspectRatio = '1 / 1';
        el.style.backgroundColor = hexToRgba(sbu.color, sbu.bubbleOpacity !== undefined ? sbu.bubbleOpacity : 100);
        const compVal = Math.max(1.0, Math.min(5.0, sbu.comp)); const attrVal = Math.max(1.0, Math.min(5.0, sbu.attr));
        el.style.left = (100 - (((compVal - 1) / 4) * 100)) + '%'; el.style.top = (100 - (((attrVal - 1) / 4) * 100)) + '%';
        const label = document.createElement('div'); label.className = 'bubble-label label-' + sbu.pos; label.textContent = sbu.name;
        label.style.backgroundColor = hexToRgba(sbu.labelBgColor || "#ffffff", sbu.labelBgOpacity !== undefined ? sbu.labelBgOpacity : 90);
        el.appendChild(label); plotArea.appendChild(el);
    });
}
document.getElementById('ge-add').onclick = () => { geData.push({ name: "New SBU", attr: 3.0, comp: 3.0, size: 30, color: "#1976d2", bubbleOpacity: 100, pos: "top", labelBgColor: "#ffffff", labelBgOpacity: 90 }); buildGETable(); renderGEChart(); };
document.getElementById('ge-clear').onclick = () => { geData = []; buildGETable(); renderGEChart(); };
document.getElementById('ge-tbody').addEventListener('input', e => { if(e.target.classList.contains('ge-input')){ geData[e.target.dataset.idx][e.target.dataset.field] = e.target.type==='number'?parseFloat(e.target.value):e.target.value; renderGEChart(); } });
document.getElementById('ge-tbody').addEventListener('click', e => { if(e.target.classList.contains('btn-delete')){ geData.splice(e.target.dataset.idx, 1); buildGETable(); renderGEChart(); } });
document.getElementById('ge-theme').addEventListener('change', e => {
    const root = document.documentElement;
    if (e.target.value === 'orange') {
        root.style.setProperty('--ge-inv-bg', '#ffe0b2'); root.style.setProperty('--ge-main-bg', '#ffb74d'); root.style.setProperty('--ge-div-bg', '#f57c00');
        root.style.setProperty('--grid-gap-color', '#fff'); root.style.setProperty('--grid-border', 'none');
        root.style.setProperty('--ge-inv-color', '#212121'); root.style.setProperty('--ge-main-color', '#212121'); root.style.setProperty('--ge-div-color', '#fff');
        document.getElementById('ge-bg-invest').value = '#ffe0b2'; document.getElementById('ge-bg-maintain').value = '#ffb74d'; document.getElementById('ge-bg-divest').value = '#f57c00'; document.getElementById('ge-color-axis').value = '#d84315';
    } else if (e.target.value === 'bw') {
        root.style.setProperty('--ge-inv-bg', '#ffffff'); root.style.setProperty('--ge-main-bg', '#ffffff'); root.style.setProperty('--ge-div-bg', '#ffffff');
        root.style.setProperty('--grid-gap-color', '#000'); root.style.setProperty('--grid-border', '2px solid #000');
        root.style.setProperty('--ge-inv-color', '#000'); root.style.setProperty('--ge-main-color', '#000'); root.style.setProperty('--ge-div-color', '#000');
        document.getElementById('ge-bg-invest').value = '#ffffff'; document.getElementById('ge-bg-maintain').value = '#ffffff'; document.getElementById('ge-bg-divest').value = '#ffffff'; document.getElementById('ge-color-axis').value = '#000000';
    }
});
['ge-color-axis', 'ge-bg-invest', 'ge-bg-maintain', 'ge-bg-divest'].forEach(id => {
    document.getElementById(id).addEventListener('input', e => {
        const root = document.documentElement;
        if(document.getElementById('ge-theme').value === 'custom') {
            root.style.setProperty('--grid-gap-color', '#fff'); root.style.setProperty('--grid-border', 'none');
            root.style.setProperty('--ge-inv-color', '#212121'); root.style.setProperty('--ge-main-color', '#212121'); root.style.setProperty('--ge-div-color', '#fff');
        }
        if(id === 'ge-color-axis') root.style.setProperty('--axis-color', e.target.value);
        if(id === 'ge-bg-invest') root.style.setProperty('--ge-inv-bg', e.target.value);
        if(id === 'ge-bg-maintain') root.style.setProperty('--ge-main-bg', e.target.value);
        if(id === 'ge-bg-divest') root.style.setProperty('--ge-div-bg', e.target.value);
        document.getElementById('ge-theme').value = 'custom';
    });
});

/* --- GS MATRIX LOGIC --- */
function buildGSTable() {
    const tbody = document.getElementById('gs-tbody'); tbody.innerHTML = '';
    if (!gsData.length) { tbody.innerHTML = '<tr><td colspan="10">No Entities added.</td></tr>'; return; }
    gsData.forEach((sbu, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${sbu.name || ''}" data-idx="${i}" data-field="name" class="gs-input"></td>
            <td><input type="number" min="0" max="9" step="0.1" value="${sbu.x !== undefined ? sbu.x : 5.0}" data-idx="${i}" data-field="x" class="gs-input"></td>
            <td><input type="number" min="0" max="9" step="0.1" value="${sbu.y !== undefined ? sbu.y : 5.0}" data-idx="${i}" data-field="y" class="gs-input"></td>
            <td><input type="number" min="10" max="100" value="${sbu.size || 30}" data-idx="${i}" data-field="size" class="gs-input"></td>
            <td><input type="color" value="${sbu.color || '#43a047'}" data-idx="${i}" data-field="color" class="gs-input"></td>
            <td><input type="number" min="0" max="100" value="${sbu.bubbleOpacity !== undefined ? sbu.bubbleOpacity : 100}" data-idx="${i}" data-field="bubbleOpacity" class="gs-input"></td>
            <td><select data-idx="${i}" data-field="pos" class="gs-input"><option value="top" ${sbu.pos==='top'?'selected':''}>Top</option><option value="bottom" ${sbu.pos==='bottom'?'selected':''}>Bot</option><option value="left" ${sbu.pos==='left'?'selected':''}>Left</option><option value="right" ${sbu.pos==='right'?'selected':''}>Right</option></select></td>
            <td><input type="color" value="${sbu.labelBgColor || '#ffffff'}" data-idx="${i}" data-field="labelBgColor" class="gs-input"></td>
            <td><input type="number" min="0" max="100" value="${sbu.labelBgOpacity !== undefined ? sbu.labelBgOpacity : 90}" data-idx="${i}" data-field="labelBgOpacity" class="gs-input"></td>
            <td><button class="btn-delete" data-idx="${i}">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}
function renderGSChart() {
    const plotArea = document.getElementById('gs-plot-area'); plotArea.innerHTML = '';
    gsData.forEach((sbu) => {
        const el = document.createElement('div'); el.className = 'bubble'; 
        el.style.width = (sbu.size / 700 * 100) + '%'; el.style.aspectRatio = '1 / 1';
        el.style.backgroundColor = hexToRgba(sbu.color, sbu.bubbleOpacity !== undefined ? sbu.bubbleOpacity : 100);
        const xVal = Math.max(0, Math.min(9, sbu.x !== undefined ? sbu.x : 5.0)); 
        const yVal = Math.max(0, Math.min(9, sbu.y !== undefined ? sbu.y : 5.0));
        el.style.left = ((xVal / 9) * 100) + '%'; 
        el.style.top = (100 - ((yVal / 9) * 100)) + '%';
        const label = document.createElement('div'); label.className = 'bubble-label label-' + (sbu.pos || 'top'); label.textContent = sbu.name;
        label.style.backgroundColor = hexToRgba(sbu.labelBgColor || "#ffffff", sbu.labelBgOpacity !== undefined ? sbu.labelBgOpacity : 90);
        el.appendChild(label); plotArea.appendChild(el);
    });
    
    document.documentElement.style.setProperty('--gs-bg', document.getElementById('gs-bg-color').value);
    document.documentElement.style.setProperty('--gs-text-color', document.getElementById('gs-text-color').value);
    document.documentElement.style.setProperty('--gs-line-color', document.getElementById('gs-line-color').value);
}
document.getElementById('gs-add').onclick = () => { gsData.push({ name: "New Entity", x: 5.0, y: 5.0, size: 30, color: "#43a047", bubbleOpacity: 100, pos: "top", labelBgColor: "#ffffff", labelBgOpacity: 90 }); buildGSTable(); renderGSChart(); };
document.getElementById('gs-clear').onclick = () => { gsData = []; buildGSTable(); renderGSChart(); };
document.getElementById('gs-toggle').onclick = () => { document.getElementById('gs-container').classList.toggle('show-reference'); };
document.getElementById('gs-tbody').addEventListener('input', e => { if(e.target.classList.contains('gs-input')){ gsData[e.target.dataset.idx][e.target.dataset.field] = e.target.type==='number'?parseFloat(e.target.value):e.target.value; renderGSChart(); } });
document.getElementById('gs-tbody').addEventListener('click', e => { if(e.target.classList.contains('btn-delete')){ gsData.splice(e.target.dataset.idx, 1); buildGSTable(); renderGSChart(); } });
['gs-bg-color', 'gs-text-color', 'gs-line-color'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderGSChart);
});

/* --- STRATEGY MAP LOGIC --- */
function buildSMTable() {
    const tbody = document.getElementById('sm-tbody'); tbody.innerHTML = '';
    if (!smData.objectives || !smData.objectives.length) { tbody.innerHTML = '<tr><td colspan="3">No objectives added.</td></tr>'; return; }
    smData.objectives.forEach((obj, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><select data-idx="${i}" data-field="perspective" class="sm-input">
                <option value="fin" ${obj.perspective==='fin'?'selected':''}>Financial</option>
                <option value="cus" ${obj.perspective==='cus'?'selected':''}>Customer</option>
                <option value="int" ${obj.perspective==='int'?'selected':''}>Internal Business</option>
                <option value="lrn" ${obj.perspective==='lrn'?'selected':''}>Learning & Growth</option>
            </select></td>
            <td><input type="text" value="${obj.text || ''}" data-idx="${i}" data-field="text" class="sm-input"></td>
            <td><button class="btn-delete" data-idx="${i}" style="width: 100%;">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}
function renderSMChart() {
    document.getElementById('sm-fin-content').innerHTML = '';
    document.getElementById('sm-cus-content').innerHTML = '';
    document.getElementById('sm-int-content').innerHTML = '';
    document.getElementById('sm-lrn-content').innerHTML = '';
    
    if(smData.objectives) {
        smData.objectives.forEach(obj => {
            const el = document.createElement('div'); 
            el.className = 'sm-box'; 
            el.innerText = obj.text;
            const targetContent = document.getElementById(`sm-${obj.perspective}-content`);
            if(targetContent) targetContent.appendChild(el);
        });
    }
}
function updateSMUI() {
    if(!smData.colors) smData.colors = { mvBg: "#ffffff", mvColor: "#334155", finBg: "#1e293b", finColor: "#ffffff", cusBg: "#0d9488", cusColor: "#ffffff", intBg: "#7c3aed", intColor: "#ffffff", lrnBg: "#e11d48", lrnColor: "#ffffff" };
    
    document.getElementById('sm-mission-input').value = smData.mission || '';
    document.getElementById('sm-vision-input').value = smData.vision || '';
    document.getElementById('sm-mission-display').querySelector('span').innerText = smData.mission || '';
    document.getElementById('sm-vision-display').querySelector('span').innerText = smData.vision || '';
    
    document.getElementById('sm-mv-bg').value = smData.colors.mvBg;
    document.getElementById('sm-mv-color').value = smData.colors.mvColor;
    document.getElementById('sm-fin-bg').value = smData.colors.finBg;
    document.getElementById('sm-fin-color').value = smData.colors.finColor;
    document.getElementById('sm-cus-bg').value = smData.colors.cusBg;
    document.getElementById('sm-cus-color').value = smData.colors.cusColor;
    document.getElementById('sm-int-bg').value = smData.colors.intBg;
    document.getElementById('sm-int-color').value = smData.colors.intColor;
    document.getElementById('sm-lrn-bg').value = smData.colors.lrnBg;
    document.getElementById('sm-lrn-color').value = smData.colors.lrnColor;
    
    const root = document.documentElement;
    root.style.setProperty('--sm-mv-bg', smData.colors.mvBg); root.style.setProperty('--sm-mv-color', smData.colors.mvColor);
    root.style.setProperty('--sm-fin-bg', smData.colors.finBg); root.style.setProperty('--sm-fin-color', smData.colors.finColor);
    root.style.setProperty('--sm-cus-bg', smData.colors.cusBg); root.style.setProperty('--sm-cus-color', smData.colors.cusColor);
    root.style.setProperty('--sm-int-bg', smData.colors.intBg); root.style.setProperty('--sm-int-color', smData.colors.intColor);
    root.style.setProperty('--sm-lrn-bg', smData.colors.lrnBg); root.style.setProperty('--sm-lrn-color', smData.colors.lrnColor);
    
    root.style.setProperty('--sm-fin-light', hexToRgba(smData.colors.finBg, 12));
    root.style.setProperty('--sm-cus-light', hexToRgba(smData.colors.cusBg, 12));
    root.style.setProperty('--sm-int-light', hexToRgba(smData.colors.intBg, 12));
    root.style.setProperty('--sm-lrn-light', hexToRgba(smData.colors.lrnBg, 12));
}
document.getElementById('sm-add').onclick = () => { if(!smData.objectives) smData.objectives = []; smData.objectives.push({ perspective: "fin", text: "New Objective" }); buildSMTable(); renderSMChart(); };
document.getElementById('sm-clear').onclick = () => { smData.objectives = []; buildSMTable(); renderSMChart(); };
document.getElementById('sm-tbody').addEventListener('input', e => { if(e.target.classList.contains('sm-input')){ smData.objectives[e.target.dataset.idx][e.target.dataset.field] = e.target.value; renderSMChart(); } });
document.getElementById('sm-tbody').addEventListener('click', e => { if(e.target.classList.contains('btn-delete')){ smData.objectives.splice(e.target.dataset.idx, 1); buildSMTable(); renderSMChart(); } });
['sm-mission-input', 'sm-vision-input'].forEach(id => {
    document.getElementById(id).addEventListener('input', e => {
        const field = id.includes('mission') ? 'mission' : 'vision';
        smData[field] = e.target.value;
        document.getElementById(`sm-${field}-display`).querySelector('span').innerText = e.target.value;
    });
});
['sm-mv-bg', 'sm-mv-color', 'sm-fin-bg', 'sm-fin-color', 'sm-cus-bg', 'sm-cus-color', 'sm-int-bg', 'sm-int-color', 'sm-lrn-bg', 'sm-lrn-color'].forEach(id => {
    document.getElementById(id).addEventListener('input', e => {
        const key = id.replace('sm-', '').replace('-bg', 'Bg').replace('-color', 'Color');
        smData.colors[key] = e.target.value;
        updateSMUI();
    });
});

/* --- PORTER'S 5 FORCES LOGIC --- */
function buildPortersTable() {
    const tbody = document.getElementById('porters-tbody'); tbody.innerHTML = '';
    portersData.forEach((force, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:bold; font-size:12px;">${force.id.toUpperCase()}</td>
            <td><select data-idx="${i}" data-field="rating" class="porters-input">
                <option value="Low" ${force.rating==='Low'?'selected':''}>Low</option>
                <option value="Moderate" ${force.rating==='Moderate'?'selected':''}>Moderate</option>
                <option value="High" ${force.rating==='High'?'selected':''}>High</option>
            </select></td>
            <td><input type="color" value="${force.bg}" data-idx="${i}" data-field="bg" class="porters-input"></td>
            <td><input type="color" value="${force.color}" data-idx="${i}" data-field="color" class="porters-input"></td>
        `;
        tbody.appendChild(tr);
    });
}
function renderPortersChart() {
    const container = document.getElementById('porters-container'); container.innerHTML = '';
    portersData.forEach(force => {
        const el = document.createElement('div'); el.className = `porters-force ${force.id}`;
        el.style.backgroundColor = force.bg; el.style.color = force.color;
        el.innerHTML = `<div class="porters-icon">${force.icon}</div><div class="porters-title">${force.title}</div><div class="porters-rating">${force.rating}</div>`;
        container.appendChild(el);
    });
}
document.getElementById('porters-reset').onclick = () => { portersData = JSON.parse(JSON.stringify(defaultPorters)); buildPortersTable(); renderPortersChart(); };
document.getElementById('porters-tbody').addEventListener('input', e => {
    if(e.target.classList.contains('porters-input')){
        portersData[e.target.dataset.idx][e.target.dataset.field] = e.target.value;
        renderPortersChart();
    }
});

/* --- DOWNLOAD LOGIC --- */
const dlConfig = { quality: 0.95, backgroundColor: '#ffffff' };
document.getElementById('ge-dl').onclick = () => htmlToImage.toJpeg(document.getElementById('ge-chart'), dlConfig).then(dataUrl => { const link = document.createElement('a'); link.download = 'GE_Matrix.jpeg'; link.href = dataUrl; link.click(); });
document.getElementById('gs-dl').onclick = () => htmlToImage.toJpeg(document.getElementById('gs-chart'), dlConfig).then(dataUrl => { const link = document.createElement('a'); link.download = 'GS_Matrix.jpeg'; link.href = dataUrl; link.click(); });
document.getElementById('sm-dl').onclick = () => htmlToImage.toJpeg(document.getElementById('sm-chart'), dlConfig).then(dataUrl => { const link = document.createElement('a'); link.download = 'Strategy_Map.jpeg'; link.href = dataUrl; link.click(); });
document.getElementById('porters-dl').onclick = () => htmlToImage.toJpeg(document.getElementById('porters-chart'), dlConfig).then(dataUrl => { const link = document.createElement('a'); link.download = 'Porters_Five_Forces.jpeg'; link.href = dataUrl; link.click(); });
