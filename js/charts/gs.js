import { state } from '../state.js';
import { GS_PRESETS } from '../defaults.js';
import { createBubble, posOptions, syncThemeInputs, bindThemeControls } from '../utils.js';

const GS_INPUT_MAP = {
    'gs-bg-color': 'bg',
    'gs-text-color': 'text',
    'gs-line-color': 'line'
};

export function buildGSTable() {
    const tbody = document.getElementById('gs-tbody'); tbody.innerHTML = '';
    if (!state.entitiesData.length) { tbody.innerHTML = '<tr><td colspan="5">No Entities defined in Master List.</td></tr>'; return; }
    state.entitiesData.forEach((sbu, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-bold p-2">${sbu.name}</td>
            <td><input type="number" min="0" max="9" step="0.01" value="${sbu.gs.xVal}" data-idx="${i}" data-field="xVal" class="gs-input"></td>
            <td><input type="number" min="0" max="9" step="0.01" value="${sbu.gs.yVal}" data-idx="${i}" data-field="yVal" class="gs-input"></td>
            <td><input type="number" min="10" max="100" value="${sbu.gs.size}" data-idx="${i}" data-field="size" class="gs-input"></td>
            <td><select data-idx="${i}" data-field="pos" class="gs-input">${posOptions(sbu.gs.pos)}</select></td>
        `;
        tbody.appendChild(tr);
    });
}

export function renderGSChart() {
    const plotArea = document.getElementById('gs-plot-area'); plotArea.innerHTML = '';
    state.entitiesData.forEach(sbu => {
        const xVal = Math.max(0, Math.min(9, sbu.gs.xVal !== undefined ? sbu.gs.xVal : 4.5));
        const yVal = Math.max(0, Math.min(9, sbu.gs.yVal !== undefined ? sbu.gs.yVal : 4.5));
        plotArea.appendChild(createBubble({
            name: sbu.name, size: sbu.gs.size, color: sbu.color, labelColor: sbu.labelColor, pos: sbu.gs.pos,
            left: (xVal / 9) * 100,
            top: 100 - ((yVal / 9) * 100)
        }));
    });

    const gs = state.appThemes.gs;
    document.documentElement.style.setProperty('--gs-bg', gs.bg);
    document.documentElement.style.setProperty('--gs-text-color', gs.text);
    document.documentElement.style.setProperty('--gs-line-color', gs.line);
}

export function applyGSTheme() {
    syncThemeInputs('gs-theme', state.appThemes.gs, GS_INPUT_MAP);
}

export function initGS() {
    document.getElementById('gs-toggle').onclick = () => {
        document.getElementById('gs-container').classList.toggle('show-reference');
    };

    document.getElementById('gs-tbody').addEventListener('input', e => {
        if (e.target.classList.contains('gs-input')) {
            state.entitiesData[e.target.dataset.idx].gs[e.target.dataset.field] =
                e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            renderGSChart();
        }
    });

    bindThemeControls({
        themeSelectId: 'gs-theme',
        getTheme: () => state.appThemes.gs,
        presets: GS_PRESETS,
        inputMap: GS_INPUT_MAP,
        onChange: renderGSChart
    });
}
