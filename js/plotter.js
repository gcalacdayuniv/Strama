import { request } from './api.js';
import { currentProjectId } from './projects.js';

let geData = [];
let gsData = [];
let smData = {
    mission: "", vision: "", objectives: [],
    colors: { mvBg: "#ffffff", mvColor: "#334155", finBg: "#1e293b", finColor: "#ffffff", cusBg: "#0d9488", cusColor: "#ffffff", intBg: "#7c3aed", intColor: "#ffffff", lrnBg: "#e11d48", lrnColor: "#ffffff" }
};

const defaultPorters = [
    { id: 'substitutes', title: 'Potential Development of<br>Substitute Products', rating: 'Moderate', bg: '#4bc89e', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>' },
    { id: 'entrants', title: 'Potential Entry of<br>New Competitors', rating: 'Moderate', bg: '#2CC6D2', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' },
    { id: 'suppliers', title: 'Bargaining Power<br>of Suppliers', rating: 'Moderate', bg: '#fbb321', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>' },
    { id: 'consumers', title: 'Bargaining Power<br>of Consumers', rating: 'Moderate', bg: '#0caae9', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' },
    { id: 'rivalry', title: 'Rivalry Among<br>Competing Firms', rating: 'Moderate', bg: '#fa7902', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' }
];
let portersData = JSON.parse(JSON.stringify(defaultPorters));

function hexToRgba(hex, alphaPercent) {
    if (!hex) return `rgba(255, 255, 255, ${alphaPercent / 100})`;
    hex = hex.replace(/^#/, '');
    if(hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alphaPercent / 100)).toFixed(2)})`;
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

/* ================= GE MCKINSEY LOGIC ================= */
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
document.getElementById('ge-tbody').addEventListener('input', e => { 
    if(e.target.classList.contains('ge-input')) { 
        geData[e.target.dataset.idx][e.target.dataset.field] = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value; 
        renderGEChart(); 
    } 
});
document.getElementById('ge-tbody').addEventListener('click', e => { 
    if(e.target.classList.contains('btn-delete')) { 
        geData.splice(e.target.dataset.idx, 1); 
        buildGETable(); 
        renderGEChart(); 
    } 
});

document.getElementById('ge-theme').addEventListener('change', e => {
    const root = document.documentElement;
    if (e.target.value === 'orange') {
        document.getElementById('ge-bg-invest').value = '#ffe0b2'; document.getElementById('ge-bg-maintain').value = '#ffb74d';
        document.getElementById('ge-bg-divest').value = '#f57c00'; document.getElementById('ge-color-axis').value = '#d84315';
        root.style.setProperty('--grid-gap-color', '#fff'); root.style.setProperty('--grid-border', 'none');
        root.style.setProperty('--ge-inv-color', '#212121'); root.style.setProperty('--ge-main-color', '#212121'); root.style.setProperty('--ge-div-color', '#fff');
    } else if (e.target.value === 'bw') {
        document.getElementById('ge-bg-invest').value = '#ffffff'; document.getElementById('ge-bg-maintain').value = '#ffffff';
        document.getElementById('ge-bg-divest').value = '#ffffff'; document.getElementById('ge-color-axis').value = '#000000';
        root.style.setProperty('--grid-gap-color', '#000'); root.style.setProperty('--grid-border', '2px solid #000');
        root.style.setProperty('--ge-inv-color', '#000'); root.style.setProperty('--ge-main-color', '#000'); root.style.setProperty('--ge-div-color', '#000');
    }
    updateGECustomColors();
});
function updateGECustomColors() {
    const root = document.documentElement;
    if(document.getElementById('ge-theme').value === 'custom') {
        root.style.setProperty('--grid-gap-color', '#fff'); root.style.setProperty('--grid-border', 'none');
        root.style.setProperty('--ge-inv-color', '#212121'); root.style.setProperty('--ge-main-color', '#212121'); root.style.setProperty('--ge-div-color', '#fff');
    }
    root.style.setProperty('--ge-inv-bg', document.getElementById('ge-bg-invest').value);
    root.style.setProperty('--ge-main-bg', document.getElementById('ge-bg-maintain').value);
    root.style.setProperty('--ge-div-bg', document.getElementById('ge-bg-divest').value);
    root.style.setProperty('--axis-color', document.getElementById('ge-color-axis').value);
}
['ge-color-axis', 'ge-bg-invest', 'ge-bg-maintain', 'ge-bg-divest'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        document.getElementById('ge-theme').value = 'custom';
        updateGECustomColors();
    });
});

/* ================= GRAND STRATEGY LOGIC ================= */
function buildGSTable() {
    const tbody = document.getElementById('gs-tbody'); tbody.innerHTML = '';
    if (!gsData.length) { tbody.innerHTML = '<tr><td colspan="10">No Entities added.</td></tr>'; return; }
    gsData.forEach((sbu, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${sbu.name || ''}" data-idx="${i}" data-field="name" class="gs-input"></td>
            <td><input type="number" min="0" max="9" step="0.01" value="${sbu.xVal !== undefined ? sbu.xVal : 4.5}" data-idx="${i}" data-field="xVal" class="gs-input"></td>
            <td><input type="number" min="0" max="9" step="0.01" value="${sbu.yVal !== undefined ? sbu.yVal : 4.5}" data-idx="${i}" data-field="yVal" class="gs-input"></td>
            <td><input type="number" min="10" max="100" value="${sbu.size || 30}" data-idx="${i}" data-field="size" class="gs-input"></td>
            <td><input type="color" value="${sbu.color || '#1976d2'}" data-idx="${i}" data-field="color" class="gs-input"></td>
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
        const el = document.createElement('div'); el.className = 'bubble'; el.style.width = (sbu.size / 700 * 100) + '%'; el.style.aspectRatio = '1 / 1';
        el.style.backgroundColor = hexToRgba(sbu.color, sbu.bubbleOpacity !== undefined ? sbu.bubbleOpacity : 100);
        const xVal = Math.max(0, Math.min(9, sbu.xVal !== undefined ? sbu.xVal : 4.5)); 
        const yVal = Math.max(0, Math.min(9, sbu.yVal !== undefined ? sbu.yVal : 4.5));
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
document.getElementById('gs-add').onclick = () => { gsData.push({ name: "New Entity", xVal: 5.0, yVal: 5.0, size: 30, color: "#43a047", bubbleOpacity: 100, pos: "top", labelBgColor: "#ffffff", labelBgOpacity: 90 }); buildGSTable(); renderGSChart(); };
document.getElementById('gs-clear').onclick = () => { gsData = []; buildGSTable(); renderGSChart(); };
document.getElementById('gs-toggle').onclick = () => { document.getElementById('gs-container').classList.toggle('show-reference'); };
document.getElementById('gs-tbody').addEventListener('input', e => { 
    if(e.target.classList.contains('gs-input')) { 
        gsData[e.target.dataset.idx][e.target.dataset.field] = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value; 
        renderGSChart(); 
    } 
});
document.getElementById('gs-tbody').addEventListener('click', e => { 
    if(e.target.classList.contains('btn-delete')) { 
        gsData.splice(e.target.dataset.idx, 1); 
        buildGSTable(); 
        renderGSChart(); 
    } 
});
['gs-bg-color', 'gs-text-color', 'gs-line-color'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderGSChart);
});

/* ================= STRATEGY MAP LOGIC ================= */
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
    document.querySelector('#sm-mission-display span').innerText = smData.mission || '';
    document.querySelector('#sm-vision-display span').innerText = smData.vision || '';
    
    document.getElementById('sm-mv-bg').value = smData.colors.mvBg; document.getElementById('sm-mv-color').value = smData.colors.mvColor;
    document.getElementById('sm-fin-bg').value = smData.colors.finBg; document.getElementById('sm-fin-color').value = smData.colors.finColor;
    document.getElementById('sm-cus-bg').value = smData.colors.cusBg; document.getElementById('sm-cus-color').value = smData.colors.cusColor;
    document.getElementById('sm-int-bg').value = smData.colors.intBg; document.getElementById('sm-int-color').value = smData.colors.intColor;
    document.getElementById('sm-lrn-bg').value = smData.colors.lrnBg; document.getElementById('sm-lrn-color').value = smData.colors.lrnColor;
    
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

document.getElementById('sm-add').onclick = () => { 
    if(!smData.objectives) smData.objectives = []; 
    smData.objectives.push({ perspective: "fin", text: "Increase revenue" }); 
    buildSMTable(); 
    renderSMChart(); 
};
document.getElementById('sm-clear').onclick = () => { smData.objectives = []; buildSMTable(); renderSMChart(); };
document.getElementById('sm-tbody').addEventListener('input', e => { 
    if(e.target.classList.contains('sm-input')){ 
        smData.objectives[e.target.dataset.idx][e.target.dataset.field] = e.target.value; 
        renderSMChart(); 
    } 
});
document.getElementById('sm-tbody').addEventListener('click', e => { 
    if(e.target.classList.contains('btn-delete')){ 
        smData.objectives.splice(e.target.dataset.idx, 1); 
        buildSMTable(); 
        renderSMChart(); 
    } 
});
['sm-mission-input', 'sm-vision-input'].forEach(id => {
    document.getElementById(id).addEventListener('input', e => {
        const field = id.includes('mission') ? 'mission' : 'vision';
        smData[field] = e.target.value;
        document.querySelector(`#sm-${field}-display span`).innerText = e.target.value;
    });
});
['sm-mv-bg', 'sm-mv-color', 'sm-fin-bg', 'sm-fin-color', 'sm-cus-bg', 'sm-cus-color', 'sm-int-bg', 'sm-int-color', 'sm-lrn-bg', 'sm-lrn-color'].forEach(id => {
    document.getElementById(id).addEventListener('input', e => {
        const key = id.replace('sm-', '').replace('-bg', 'Bg').replace('-color', 'Color');
        smData.colors[key] = e.target.value;
        updateSMUI();
    });
});

/* ================= PORTER'S 5 FORCES LOGIC ================= */
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

/* ================= DOWNLOAD LOGIC ================= */
const downloadAsDesktop = (elementId, filename) => {
    const element = document.getElementById(elementId);
    const optimalWidth = 1515;
    const currentWidth = element.offsetWidth || 1;
    const currentHeight = element.offsetHeight || 1;
    
    // Calculate proportional height to maintain aspect ratio without distortion
    const optimalHeight = (currentHeight / currentWidth) * optimalWidth;

    const dlConfig = { 
        quality: 0.95, 
        backgroundColor: '#ffffff',
        width: optimalWidth,
        height: optimalHeight,
        style: {
            width: `${optimalWidth}px`,
            height: `${optimalHeight}px`,
            maxWidth: 'none',
            transform: 'none'
        }
    };

    htmlToImage.toJpeg(element, dlConfig)
        .then(dataUrl => { 
            const link = document.createElement('a'); 
            link.download = filename; 
            link.href = dataUrl; 
            link.click(); 
        })
        .catch(err => alert("Error generating download: " + err.message));
};

if(document.getElementById('ge-dl')) {
    document.getElementById('ge-dl').onclick = () => downloadAsDesktop('ge-chart', 'GE_Matrix.jpeg');
}
if(document.getElementById('gs-dl')) {
    document.getElementById('gs-dl').onclick = () => downloadAsDesktop('gs-chart', 'GS_Matrix.jpeg');
}
if(document.getElementById('sm-dl')) {
    document.getElementById('sm-dl').onclick = () => downloadAsDesktop('sm-chart', 'Strategy_Map.jpeg');
}
if(document.getElementById('porters-dl')) {
    document.getElementById('porters-dl').onclick = () => downloadAsDesktop('porters-chart', 'Porters_Five_Forces.jpeg');
}
