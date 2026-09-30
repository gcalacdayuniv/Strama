import { state } from '../state.js';
import { GE_PRESETS } from '../defaults.js';
import { createBubble, posOptions, syncThemeInputs, bindThemeControls } from '../utils.js';

const GE_INPUT_MAP = {
    'ge-color-axis': 'axis',
    'ge-bg-invest': 'invest',
    'ge-bg-maintain': 'maintain',
    'ge-bg-divest': 'divest'
};

export function buildGETable() {
    const tbody = document.getElementById('ge-tbody'); tbody.innerHTML = '';
    if (!state.entitiesData.length) { tbody.innerHTML = '<tr><td colspan="5">No Entities defined in Master List.</td></tr>'; return; }
    state.entitiesData.forEach((sbu, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-bold p-2">${sbu.name}</td>
            <td><input type="number" min="1.0" max="5.0" step="0.01" value="${sbu.ge.attr}" data-idx="${i}" data-field="attr" class="ge-input"></td>
            <td><input type="number" min="1.0" max="5.0" step="0.01" value="${sbu.ge.comp}" data-idx="${i}" data-field="comp" class="ge-input"></td>
            <td><input type="number" min="10" max="100" value="${sbu.ge.size}" data-idx="${i}" data-field="size" class="ge-input"></td>
            <td><select data-idx="${i}" data-field="pos" class="ge-input">${posOptions(sbu.ge.pos)}</select></td>
        `;
        tbody.appendChild(tr);
    });
}

export function renderGEChart() {
    const plotArea = document.getElementById('ge-plot-area'); plotArea.innerHTML = '';
    state.entitiesData.forEach(sbu => {
        const compVal = Math.max(1.0, Math.min(5.0, sbu.ge.comp));
        const attrVal = Math.max(1.0, Math.min(5.0, sbu.ge.attr));
        plotArea.appendChild(createBubble({
            name: sbu.name, size: sbu.ge.size, color: sbu.color, labelColor: sbu.labelColor, pos: sbu.ge.pos,
            left: 100 - (((compVal - 1) / 4) * 100),
            top: 100 - (((attrVal - 1) / 4) * 100)
        }));
    });
}

export function updateGECustomColors() {
    const ge = state.appThemes.ge;
    const root = document.documentElement;
    if (ge.preset === 'custom' || document.getElementById('ge-theme').value === 'custom') {
        root.style.setProperty('--grid-gap-color', '#fff'); root.style.setProperty('--grid-border', 'none');
        root.style.setProperty('--ge-inv-color', '#212121'); root.style.setProperty('--ge-main-color', '#212121'); root.style.setProperty('--ge-div-color', '#fff');
    } else if (ge.preset === 'bw') {
        root.style.setProperty('--grid-gap-color', '#000'); root.style.setProperty('--grid-border', '2px solid #000');
        root.style.setProperty('--ge-inv-color', '#000'); root.style.setProperty('--ge-main-color', '#000'); root.style.setProperty('--ge-div-color', '#000');
    } else {
        root.style.setProperty('--grid-gap-color', '#fff'); root.style.setProperty('--grid-border', 'none');
        root.style.setProperty('--ge-inv-color', '#212121'); root.style.setProperty('--ge-main-color', '#212121'); root.style.setProperty('--ge-div-color', '#fff');
    }
    root.style.setProperty('--ge-inv-bg', ge.invest);
    root.style.setProperty('--ge-main-bg', ge.maintain);
    root.style.setProperty('--ge-div-bg', ge.divest);
    root.style.setProperty('--axis-color', ge.axis);
}

export function applyGETheme() {
    syncThemeInputs('ge-theme', state.appThemes.ge, GE_INPUT_MAP);
    updateGECustomColors();
}

export function initGE() {
    document.getElementById('ge-tbody').addEventListener('input', e => {
        if (e.target.classList.contains('ge-input')) {
            state.entitiesData[e.target.dataset.idx].ge[e.target.dataset.field] =
                e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            renderGEChart();
        }
    });

    bindThemeControls({
        themeSelectId: 'ge-theme',
        getTheme: () => state.appThemes.ge,
        presets: GE_PRESETS,
        inputMap: GE_INPUT_MAP,
        onChange: updateGECustomColors
    });
}
