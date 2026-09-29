import { request } from './api.js';
import { currentProjectId } from './projects.js';

let geData = [];
let gsData = [];
let spaceData = [];
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
    return `rgba(${r},${g}, ${b},${Math.max(0, Math.min(1, alphaPercent / 100)).toFixed(2)})`;
}

export function loadProjectIntoEditor(project) {
    geData = project.ge_data ? JSON.parse(project.ge_data) : [];
    gsData = project.gs_data ? JSON.parse(project.gs_data) : [];
    spaceData = project.space_data ? JSON.parse(project.space_data) : [];
    smData = project.sm_data ? JSON.parse(project.sm_data) : { mission: "", vision: "", objectives: [], colors: { mvBg: "#ffffff", mvColor: "#334155", finBg: "#1e293b", finColor: "#ffffff", cusBg: "#0d9488", cusColor: "#ffffff", intBg: "#7c3aed", intColor: "#ffffff", lrnBg: "#e11d48", lrnColor: "#ffffff" }};
    portersData = project.porters_data ? JSON.parse(project.porters_data) : JSON.parse(JSON.stringify(defaultPorters));
    
    renderAll();
}

export async function saveCurrentProject() {
    try {
        const title = document.getElementById('editor-project-title').innerText;
        await request(`/projects/${currentProjectId}`, 'PUT', {
            name: title, ge_data: geData, gs_data: gsData, space_data: spaceData, sm_data: smData, porters_data: portersData
        });
        alert('Project saved successfully');
    } catch (e) { alert(e.message); }
}

function renderAll() {
    buildGETable(); renderGEChart();
    buildGSTable(); renderGSChart();
    buildSpaceTable(); renderSpaceChart();
    buildSMTable(); renderSMChart(); updateSMUI();
    buildPortersTable(); renderPortersChart();
}

/* ================= GE MCKINSEY LOGIC ================= */
function buildGETable() {
    const tbody = document.getElementById('ge-tbody'); tbody.innerHTML = '';
    if (!geData.length) { tbody.innerHTML = '<tr><td colspan="9">No SBUs added.</td></tr>'; return; }
    geData.forEach((sbu, i) => {
        const bOpac = sbu.bubbleOpacity !== undefined ? sbu.bubbleOpacity : 100;
        const lblCol = sbu.labelColor || '#ffffff';
        const sTop = sbu.pos === 'top' ? 'selected' : '';
        const sBot = sbu.pos === 'bottom' ? 'selected' : '';
        const sLft = sbu.pos === 'left' ? 'selected' : '';
        const sRgt = sbu.pos === 'right' ? 'selected' : '';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${sbu.name}" data-idx="${i}" data-field="name" class="ge-input"></td>
            <td><input type="number" min="1.0" max="5.0" step="0.01" value="${sbu.attr}" data-idx="${i}" data-field="attr" class="ge-input"></td>
            <td><input type="number" min="1.0" max="5.0" step="0.01" value="${sbu.comp}" data-idx="${i}" data-field="comp" class="ge-input"></td>
            <td><input type="number" min="10" max="100" value="${sbu.size}" data-idx="${i}" data-field="size" class="ge-input"></td>
            <td><input type="color" value="${sbu.color}" data-idx="${i}" data-field="color" class="ge-input"></td>
            <td><input type="color" value="${lblCol}" data-idx="${i}" data-field="labelColor" class="ge-input"></td>
            <td><input type="number" min="0" max="100" value="${bOpac}" data-idx="${i}" data-field="bubbleOpacity" class="ge-input"></td>
            <td><select data-idx="${i}" data-field="pos" class="ge-input">
                <option value="top" ${sTop}>Top</option>
                <option value="bottom" ${sBot}>Bot</option>
                <option value="left" ${sLft}>Left</option>
                <option value="right" ${sRgt}>Right</option>
            </select></td>
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
        const label = document.createElement('div'); label.className = 'bubble-label label-' + (sbu.pos || 'top'); label.textContent = sbu.name;
        
        label.style.color = sbu.labelColor || '#ffffff'; 
        label.style.textShadow = '0px 0px 2px rgba(0,0,0,0.5)';
        label.style.backgroundColor = hexToRgba(sbu.color || "#1976d2", 70);
        
        el.appendChild(label); plotArea.appendChild(el);
    });
}

document.getElementById('ge-add').onclick = () => { geData.push({ name: "New SBU", attr: 3.0, comp: 3.0, size: 30, color: "#1976d2", labelColor: "#ffffff", bubbleOpacity: 100, pos: "top" }); buildGETable(); renderGEChart(); };
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
    if (!gsData.length) { tbody.innerHTML = '<tr><td colspan="9">No Entities added.</td></tr>'; return; }
    gsData.forEach((sbu, i) => {
        const nm = sbu.name || '';
        const xV = sbu.xVal !== undefined ? sbu.xVal : 4.5;
        const yV = sbu.yVal !== undefined ? sbu.yVal : 4.5;
        const sz = sbu.size || 30;
        const col = sbu.color || '#1976d2';
        const lblCol = sbu.labelColor || '#ffffff';
        const bOpac = sbu.bubbleOpacity !== undefined ? sbu.bubbleOpacity : 100;
        const sTop = sbu.pos === 'top' ? 'selected' : '';
        const sBot = sbu.pos === 'bottom' ? 'selected' : '';
        const sLft = sbu.pos === 'left' ? 'selected' : '';
        const sRgt = sbu.pos === 'right' ? 'selected' : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${nm}" data-idx="${i}" data-field="name" class="gs-input"></td>
            <td><input type="number" min="0" max="9" step="0.01" value="${xV}" data-idx="${i}" data-field="xVal" class="gs-input"></td>
            <td><input type="number" min="0" max="9" step="0.01" value="${yV}" data-idx="${i}" data-field="yVal" class="gs-input"></td>
            <td><input type="number" min="10" max="100" value="${sz}" data-idx="${i}" data-field="size" class="gs-input"></td>
            <td><input type="color" value="${col}" data-idx="${i}" data-field="color" class="gs-input"></td>
            <td><input type="color" value="${lblCol}" data-idx="${i}" data-field="labelColor" class="gs-input"></td>
            <td><input type="number" min="0" max="100" value="${bOpac}" data-idx="${i}" data-field="bubbleOpacity" class="gs-input"></td>
            <td><select data-idx="${i}" data-field="pos" class="gs-input">
                <option value="top" ${sTop}>Top</option>
                <option value="bottom" ${sBot}>Bot</option>
                <option value="left" ${sLft}>Left</option>
                <option value="right" ${sRgt}>Right</option>
            </select></td>
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
        
        label.style.color = sbu.labelColor || '#ffffff'; 
        label.style.textShadow = '0px 0px 2px rgba(0,0,0,0.5)';
        label.style.backgroundColor = hexToRgba(sbu.color || "#1976d2", 70);
        
        el.appendChild(label); plotArea.appendChild(el);
    });
    
    document.documentElement.style.setProperty('--gs-bg', document.getElementById('gs-bg-color').value);
    document.documentElement.style.setProperty('--gs-text-color', document.getElementById('gs-text-color').value);
    document.documentElement.style.setProperty('--gs-line-color', document.getElementById('gs-line-color').value);
}

document.getElementById('gs-add').onclick = () => { gsData.push({ name: "New Entity", xVal: 5.0, yVal: 5.0, size: 30, color: "#43a047", labelColor: "#ffffff", bubbleOpacity: 100, pos: "top" }); buildGSTable(); renderGSChart(); };
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

document.getElementById('gs-theme').addEventListener('change', e => {
    if (e.target.value === 'default') {
        document.getElementById('gs-bg-color').value = '#e2ecc9';
        document.getElementById('gs-text-color').value = '#212121';
        document.getElementById('gs-line-color').value = '#212121';
    } else if (e.target.value === 'bw') {
        document.getElementById('gs-bg-color').value = '#ffffff';
        document.getElementById('gs-text-color').value = '#000000';
        document.getElementById('gs-line-color').value = '#000000';
    }
    renderGSChart();
});

['gs-bg-color', 'gs-text-color', 'gs-line-color'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        document.getElementById('gs-theme').value = 'custom';
        renderGSChart();
    });
});


/* ================= SPACE MATRIX LOGIC ================= */
if(document.getElementById('space-toggle')) {
    document.getElementById('space-toggle').onclick = () => {
        document.getElementById('space-container').classList.toggle('show-reference');
    };
}

function buildSpaceTable() {
    const tbody = document.getElementById('space-tbody'); tbody.innerHTML = '';
    if (!spaceData.length) { tbody.innerHTML = '<tr><td colspan="8">No Entities added.</td></tr>'; return; }
    spaceData.forEach((sbu, i) => {
        const nm = sbu.name || '';
        const xV = sbu.xVal !== undefined ? sbu.xVal : 3.0;
        const yV = sbu.yVal !== undefined ? sbu.yVal : 3.0;
        const sz = sbu.size || 30;
        const col = sbu.color || '#9c27b0';
        const lblCol = sbu.labelColor || '#ffffff';
        const sTop = sbu.pos === 'top' ? 'selected' : '';
        const sBot = sbu.pos === 'bottom' ? 'selected' : '';
        const sLft = sbu.pos === 'left' ? 'selected' : '';
        const sRgt = sbu.pos === 'right' ? 'selected' : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${nm}" data-idx="${i}" data-field="name" class="space-input"></td>
            <td><input type="number" min="-7" max="7" step="0.01" value="${xV}" data-idx="${i}" data-field="xVal" class="space-input"></td>
            <td><input type="number" min="-7" max="7" step="0.01" value="${yV}" data-idx="${i}" data-field="yVal" class="space-input"></td>
            <td><input type="number" min="10" max="100" value="${sz}" data-idx="${i}" data-field="size" class="space-input"></td>
            <td><input type="color" value="${col}" data-idx="${i}" data-field="color" class="space-input"></td>
            <td><input type="color" value="${lblCol}" data-idx="${i}" data-field="labelColor" class="space-input"></td>
            <td><select data-idx="${i}" data-field="pos" class="space-input">
                <option value="top" ${sTop}>Top</option>
                <option value="bottom" ${sBot}>Bot</option>
                <option value="left" ${sLft}>Left</option>
                <option value="right" ${sRgt}>Right</option>
            </select></td>
            <td><button class="btn-delete" data-idx="${i}">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}
function renderSpaceChart() {
    const plotArea = document.getElementById('space-plot-area'); 
    const svgOverlay = document.getElementById('space-svg-overlay');
    plotArea.innerHTML = '';
    
    const ticksContainer = document.getElementById('space-ticks');
    if (ticksContainer.innerHTML === '') {
        let ticks = '';
        for(let i = -7; i <= 7; i++) {
            if(i === 0) continue;
            const posPct = 50 + (i / 14) * 100;
            ticks += `<div class="space-tick-x" style="left: ${posPct}%;"></div>`;
            ticks += `<div class="space-tick-label-x" style="left: ${posPct}\%;">${i}</div>`;
            
            const topPosPct = 50 - (i / 14) * 100;
            ticks += `<div class="space-tick-y" style="top: ${topPosPct}%;"></div>`;
            ticks += `<div class="space-tick-label-y" style="top: ${topPosPct}\%;">${i}</div>`;
        }
        ticksContainer.innerHTML = ticks;
    }

    let svgHtml = ``;
    spaceData.forEach((sbu, i) => {
        const arrowColor = hexToRgba(sbu.color || '#9c27b0', 80);
        svgHtml += `
        <defs>
            <marker id="arrowhead-space-${i}" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <polygon points="0 0, 8 4, 0 8" fill="${arrowColor}" />
            </marker>
        </defs>`;
    });

    spaceData.forEach((sbu, i) => {
        const xVal = Math.max(-7, Math.min(7, sbu.xVal !== undefined ? sbu.xVal : 3.0)); 
        const yVal = Math.max(-7, Math.min(7, sbu.yVal !== undefined ? sbu.yVal : 3.0));
        
        let ratio = 1;
        const vectorLen = Math.sqrt(xVal * xVal + yVal * yVal);
        if (vectorLen > 0) {
            ratio = (vectorLen + 1.25) / vectorLen;
        }
        
        const lineEndX = xVal * ratio;
        const lineEndY = yVal * ratio;
        const endXPct = 50 + (lineEndX / 14) * 100;
        const endYPct = 50 - (lineEndY / 14) * 100;
        
        const leftPct = 50 + (xVal / 14) * 100; 
        const topPct = 50 - (yVal / 14) * 100; 
        
        const arrowColor = hexToRgba(sbu.color || '#9c27b0', 80);
        svgHtml += `<line x1="50%" y1="50%" x2="${endXPct}%" y2="${endYPct}%" stroke="${arrowColor}" stroke-width="2.5" marker-end="url(#arrowhead-space-${i})" />`;

        const el = document.createElement('div'); el.className = 'bubble'; el.style.width = (sbu.size / 700 * 100) + '%'; el.style.aspectRatio = '1 / 1';
        el.style.backgroundColor = sbu.color || '#9c27b0';
        el.style.left = leftPct + '%'; 
        el.style.top = topPct + '%';
        
        const label = document.createElement('div'); label.className = 'bubble-label label-' + (sbu.pos || 'top'); label.textContent = sbu.name;
        label.style.color = sbu.labelColor || '#ffffff'; 
        label.style.textShadow = '0px 0px 2px rgba(0,0,0,0.5)';
        label.style.backgroundColor = hexToRgba(sbu.color || "#9c27b0", 70);
        
        el.appendChild(label); plotArea.appendChild(el);
    });
    
    svgOverlay.innerHTML = `<svg width="100%" height="100%" style="overflow: visible;">${svgHtml}</svg>`;
    
    document.documentElement.style.setProperty('--space-bg', document.getElementById('space-bg-color').value);
    document.documentElement.style.setProperty('--space-text-color', document.getElementById('space-text-color').value);
    document.documentElement.style.setProperty('--space-line-color', document.getElementById('space-line-color').value);
}

document.getElementById('space-add').onclick = () => { spaceData.push({ name: "New Entity", xVal: 3.0, yVal: 3.0, size: 30, color: "#9c27b0", labelColor: "#ffffff", pos: "top" }); buildSpaceTable(); renderSpaceChart(); };
document.getElementById('space-clear').onclick = () => { spaceData = []; buildSpaceTable(); renderSpaceChart(); };
document.getElementById('space-tbody').addEventListener('input', e => { 
    if(e.target.classList.contains('space-input')) { 
        spaceData[e.target.dataset.idx][e.target.dataset.field] = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value; 
        renderSpaceChart(); 
    } 
});
document.getElementById('space-tbody').addEventListener('click', e => { 
    if(e.target.classList.contains('btn-delete')) { 
        spaceData.splice(e.target.dataset.idx, 1); 
        buildSpaceTable(); 
        renderSpaceChart(); 
    } 
});

document.getElementById('space-theme').addEventListener('change', e => {
    if (e.target.value === 'default') {
        document.getElementById('space-bg-color').value = '#ffffff';
        document.getElementById('space-text-color').value = '#212121';
        document.getElementById('space-line-color').value = '#000000';
    } else if (e.target.value === 'bw') {
        document.getElementById('space-bg-color').value = '#ffffff';
        document.getElementById('space-text-color').value = '#000000';
        document.getElementById('space-line-color').value = '#000000';
    }
    renderSpaceChart();
});

['space-bg-color', 'space-text-color', 'space-line-color'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        document.getElementById('space-theme').value = 'custom';
        renderSpaceChart();
    });
});

/* ================= STRATEGY MAP LOGIC ================= */
function buildSMTable() {
    const tbody = document.getElementById('sm-tbody'); tbody.innerHTML = '';
    if (!smData.objectives || !smData.objectives.length) { tbody.innerHTML = '<tr><td colspan="3">No objectives added.</td></tr>'; return; }
    smData.objectives.forEach((obj, i) => {
        const sFin = obj.perspective === 'fin' ? 'selected' : '';
        const sCus = obj.perspective === 'cus' ? 'selected' : '';
        const sInt = obj.perspective === 'int' ? 'selected' : '';
        const sLrn = obj.perspective === 'lrn' ? 'selected' : '';
        const txt = obj.text || '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><select data-idx="${i}" data-field="perspective" class="sm-input">
                <option value="fin" ${sFin}>Financial</option>
                <option value="cus" ${sCus}>Customer</option>
                <option value="int" ${sInt}>Internal Business</option>
                <option value="lrn" ${sLrn}>Learning & Growth</option>
            </select></td>
            <td><input type="text" value="${txt}" data-idx="${i}" data-field="text" class="sm-input"></td>
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

document.getElementById('sm-theme').addEventListener('change', e => {
    if (e.target.value === 'default') {
        smData.colors = { mvBg: "#ffffff", mvColor: "#334155", finBg: "#1e293b", finColor: "#ffffff", cusBg: "#0d9488", cusColor: "#ffffff", intBg: "#7c3aed", intColor: "#ffffff", lrnBg: "#e11d48", lrnColor: "#ffffff" };
    } else if (e.target.value === 'bw') {
        smData.colors = { mvBg: "#ffffff", mvColor: "#000000", finBg: "#333333", finColor: "#ffffff", cusBg: "#555555", cusColor: "#ffffff", intBg: "#777777", intColor: "#ffffff", lrnBg: "#999999", lrnColor: "#ffffff" };
    }
    updateSMUI();
});

['sm-mv-bg', 'sm-mv-color', 'sm-fin-bg', 'sm-fin-color', 'sm-cus-bg', 'sm-cus-color', 'sm-int-bg', 'sm-int-color', 'sm-lrn-bg', 'sm-lrn-color'].forEach(id => {
    document.getElementById(id).addEventListener('input', e => {
        document.getElementById('sm-theme').value = 'custom';
        const key = id.replace('sm-', '').replace('-bg', 'Bg').replace('-color', 'Color');
        smData.colors[key] = e.target.value;
        updateSMUI();
    });
});

/* ================= PORTER'S 5 FORCES LOGIC ================= */
if(document.getElementById('porters-toggle')) {
    document.getElementById('porters-toggle').onclick = () => {
        document.getElementById('porters-chart').classList.toggle('show-radar');
    };
}

function buildPortersTable() {
    const tbody = document.getElementById('porters-tbody'); tbody.innerHTML = '';
    portersData.forEach((force, i) => {
        const idUp = force.id.toUpperCase();
        const sLow = force.rating === 'Low' ? 'selected' : '';
        const sMod = force.rating === 'Moderate' ? 'selected' : '';
        const sHigh = force.rating === 'High' ? 'selected' : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:bold; font-size:12px;">${idUp}</td>
            <td><select data-idx="${i}" data-field="rating" class="porters-input">
                <option value="Low" ${sLow}>Low</option>
                <option value="Moderate" ${sMod}>Moderate</option>
                <option value="High" ${sHigh}>High</option>
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
    
    renderPortersRadarChart();
}
function renderPortersRadarChart() {
    const radarContainer = document.getElementById('porters-radar-container');
    if (!radarContainer) return;
    
    const size = 800;
    const center = size / 2;
    const maxRadius = 240; 
    
    let svg = `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" style="font-family: sans-serif;">`;
    
    for (let level = 1; level <= 5; level++) {
        const r = (maxRadius / 5) * level;
        let points = "";
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i / 5);
            const x = center + r * Math.sin(angle);
            const y = center - r * Math.cos(angle);
            points += `${x},${y} `;
        }
        svg += `<polygon points="${points.trim()}" fill="none" stroke="#e2e8f0" stroke-width="1.5" />`;
        
        if (level > 0) {
            const textY = center - r;
            svg += `<text x="${center}" y="${textY}" font-size="14" fill="#94a3b8" text-anchor="middle" dy="-6">${level}</text>`;
        }
    }
    
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i / 5);
        const x = center + maxRadius * Math.sin(angle);
        const y = center - maxRadius * Math.cos(angle);
        svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#e2e8f0" stroke-width="1.5" />`;
    }
    
    const ratingMap = { 'Low': 1, 'Moderate': 3, 'High': 5 };
    const forceOrder = ['rivalry', 'substitutes', 'entrants', 'suppliers', 'consumers'];
    
    let dataPoints = "";
    forceOrder.forEach((forceId, i) => {
        const force = portersData.find(f => f.id === forceId);
        const score = ratingMap[force.rating] || 1;
        const r = (maxRadius / 5) * score;
        const angle = (Math.PI * 2 * i / 5);
        const x = center + r * Math.sin(angle);
        const y = center - r * Math.cos(angle);
        dataPoints += `${x},${y} `;
        
        const lx = center + (maxRadius + 60) * Math.sin(angle);
        const ly = center - (maxRadius + 45) * Math.cos(angle);
        
        const titleLines = force.title.split('<br>');
        svg += `<text x="${lx}" y="${ly}" font-size="16" font-weight="bold" fill="#334155" text-anchor="middle" dominant-baseline="middle">`;
        titleLines.forEach((line, index) => {
            const dy = index === 0 ? ((titleLines.length - 1) * -10) : 20;
            svg += `<tspan x="${lx}" dy="${dy}">${line.trim()}</tspan>`;
        });
        svg += `</text>`;
    });
    
    svg += `<polygon points="${dataPoints.trim()}" fill="rgba(250, 121, 2, 0.15)" stroke="#fa7902" stroke-width="2.5" />`;
    
    forceOrder.forEach((forceId, i) => {
        const force = portersData.find(f => f.id === forceId);
        const score = ratingMap[force.rating] || 1;
        const r = (maxRadius / 5) * score;
        const angle = (Math.PI * 2 * i / 5);
        const x = center + r * Math.sin(angle);
        const y = center - r * Math.cos(angle);
        svg += `<circle cx="${x}" cy="${y}" r="6" fill="#fa7902" />`;
    });
    
    svg += `</svg>`;
    radarContainer.innerHTML = svg;
}

document.getElementById('porters-reset').onclick = () => { portersData = JSON.parse(JSON.stringify(defaultPorters)); buildPortersTable(); renderPortersChart(); };
document.getElementById('porters-tbody').addEventListener('input', e => {
    if(e.target.classList.contains('porters-input')){
        portersData[e.target.dataset.idx][e.target.dataset.field] = e.target.value;
        renderPortersChart();
    }
});

/* ================= DOWNLOAD LOGIC ================= */
const dlConfig = { quality: 0.95, backgroundColor: '#ffffff' };
if(document.getElementById('ge-dl')) {
    document.getElementById('ge-dl').onclick = () => htmlToImage.toJpeg(document.getElementById('ge-chart'), dlConfig).then(dataUrl => { const link = document.createElement('a'); link.download = 'GE_Matrix.jpeg'; link.href = dataUrl; link.click(); });
}
if(document.getElementById('gs-dl')) {
    document.getElementById('gs-dl').onclick = () => htmlToImage.toJpeg(document.getElementById('gs-chart'), dlConfig).then(dataUrl => { const link = document.createElement('a'); link.download = 'GS_Matrix.jpeg'; link.href = dataUrl; link.click(); });
}
if(document.getElementById('space-dl')) {
    document.getElementById('space-dl').onclick = () => htmlToImage.toJpeg(document.getElementById('space-chart'), dlConfig).then(dataUrl => { const link = document.createElement('a'); link.download = 'SPACE_Matrix.jpeg'; link.href = dataUrl; link.click(); });
}
if(document.getElementById('sm-dl')) {
    document.getElementById('sm-dl').onclick = () => htmlToImage.toJpeg(document.getElementById('sm-chart'), dlConfig).then(dataUrl => { const link = document.createElement('a'); link.download = 'Strategy_Map.jpeg'; link.href = dataUrl; link.click(); });
}
if(document.getElementById('porters-dl')) {
    document.getElementById('porters-dl').onclick = () => htmlToImage.toJpeg(document.getElementById('porters-chart'), dlConfig).then(dataUrl => { const link = document.createElement('a'); link.download = 'Porters_Five_Forces.jpeg'; link.href = dataUrl; link.click(); });
}
