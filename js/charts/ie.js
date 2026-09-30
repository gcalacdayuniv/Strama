import { state } from '../state.js';
import { IE_PRESETS } from '../defaults.js';
import { createBubble, posOptions, syncThemeInputs, bindThemeControls } from '../utils.js';

const IE_INPUT_MAP = {
    'ie-grow-bg': 'grow',
    'ie-hold-bg': 'hold',
    'ie-harv-bg': 'harvest',
    'ie-text-color': 'text',
    'ie-line-color': 'line'
};

export function buildIETable() {
    const tbody = document.getElementById('ie-tbody'); tbody.innerHTML = '';
    if (!state.entitiesData.length) { tbody.innerHTML = '<tr><td colspan="5">No Entities defined in Master List.</td></tr>'; return; }
    state.entitiesData.forEach((sbu, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-bold p-2">${sbu.name}</td>
            <td><input type="number" min="1.0" max="4.0" step="0.01" value="${sbu.ie.ife}" data-idx="${i}" data-field="ife" class="ie-input"></td>
            <td><input type="number" min="1.0" max="4.0" step="0.01" value="${sbu.ie.efe}" data-idx="${i}" data-field="efe" class="ie-input"></td>
            <td><input type="number" min="10" max="100" value="${sbu.ie.size}" data-idx="${i}" data-field="size" class="ie-input"></td>
            <td><select data-idx="${i}" data-field="pos" class="ie-input">${posOptions(sbu.ie.pos)}</select></td>
        `;
        tbody.appendChild(tr);
    });
}

export function renderIEChart() {
    const plotArea = document.getElementById('ie-plot-area'); plotArea.innerHTML = '';
    state.entitiesData.forEach(sbu => {
        // X (IFE): 4.0 is on the left (0%), 1.0 is on the right (100%). Range = 3.0
        const ifeVal = Math.max(1.0, Math.min(4.0, sbu.ie.ife !== undefined ? sbu.ie.ife : 2.5));
        // Y (EFE): 4.0 is on the top (0%), 1.0 is on the bottom (100%). Range = 3.0
        const efeVal = Math.max(1.0, Math.min(4.0, sbu.ie.efe !== undefined ? sbu.ie.efe : 2.5));
        
        plotArea.appendChild(createBubble({
            name: sbu.name, size: sbu.ie.size || 30, color: sbu.color, labelColor: sbu.labelColor, pos: sbu.ie.pos,
            left: ((4.0 - ifeVal) / 3.0) * 100,
            top: ((4.0 - efeVal) / 3.0) * 100
        }));
    });

    const ie = state.appThemes.ie;
    document.documentElement.style.setProperty('--ie-grow-bg', ie.grow);
    document.documentElement.style.setProperty('--ie-hold-bg', ie.hold);
    document.documentElement.style.setProperty('--ie-harv-bg', ie.harvest);
    document.documentElement.style.setProperty('--ie-text-color', ie.text);
    document.documentElement.style.setProperty('--ie-line-color', ie.line);
}

export function applyIETheme() {
    syncThemeInputs('ie-theme', state.appThemes.ie, IE_INPUT_MAP);
}

export function initIE() {
    document.getElementById('ie-tbody').addEventListener('input', e => {
        if (e.target.classList.contains('ie-input')) {
            state.entitiesData[e.target.dataset.idx].ie[e.target.dataset.field] =
                e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            renderIEChart();
        }
    });

    bindThemeControls({
        themeSelectId: 'ie-theme',
        getTheme: () => state.appThemes.ie,
        presets: IE_PRESETS,
        inputMap: IE_INPUT_MAP,
        onChange: renderIEChart
    });
}
