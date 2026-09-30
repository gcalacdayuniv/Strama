import { state } from '../state.js';
import { BCG_PRESETS } from '../defaults.js';
import { createBubble, posOptions, syncThemeInputs, bindThemeControls } from '../utils.js';

const BCG_INPUT_MAP = {
    'bcg-bg-color': 'bg',
    'bcg-text-color': 'text',
    'bcg-line-color': 'line'
};

export function buildBCGTable() {
    const tbody = document.getElementById('bcg-tbody'); tbody.innerHTML = '';
    if (!state.entitiesData.length) { tbody.innerHTML = '<tr><td colspan="5">No Entities defined in Master List.</td></tr>'; return; }
    state.entitiesData.forEach((sbu, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-bold p-2">${sbu.name}</td>
            <td><input type="number" min="0" max="1" step="0.01" value="${sbu.bcg.xVal}" data-idx="${i}" data-field="xVal" class="bcg-input"></td>
            <td><input type="number" min="-20" max="20" step="0.1" value="${sbu.bcg.yVal}" data-idx="${i}" data-field="yVal" class="bcg-input"></td>
            <td><input type="number" min="10" max="100" value="${sbu.bcg.size}" data-idx="${i}" data-field="size" class="bcg-input"></td>
            <td><select data-idx="${i}" data-field="pos" class="bcg-input">${posOptions(sbu.bcg.pos)}</select></td>
        `;
        tbody.appendChild(tr);
    });
}

export function renderBCGChart() {
    const plotArea = document.getElementById('bcg-plot-area'); plotArea.innerHTML = '';
    state.entitiesData.forEach(sbu => {
        // X: 1.0 (High) is on the left, 0.0 (Low) on the right. Y: +20 at the top, -20 at the bottom.
        const xVal = Math.max(0, Math.min(1, sbu.bcg.xVal !== undefined ? sbu.bcg.xVal : 0.5));
        const yVal = Math.max(-20, Math.min(20, sbu.bcg.yVal !== undefined ? sbu.bcg.yVal : 0));
        plotArea.appendChild(createBubble({
            name: sbu.name, size: sbu.bcg.size || 30, color: sbu.color, labelColor: sbu.labelColor, pos: sbu.bcg.pos,
            left: (1 - xVal) * 100,
            top: ((20 - yVal) / 40) * 100
        }));
    });

    const bcg = state.appThemes.bcg;
    document.documentElement.style.setProperty('--bcg-bg', bcg.bg);
    document.documentElement.style.setProperty('--bcg-text-color', bcg.text);
    document.documentElement.style.setProperty('--bcg-line-color', bcg.line);
}

export function applyBCGTheme() {
    syncThemeInputs('bcg-theme', state.appThemes.bcg, BCG_INPUT_MAP);
}

export function initBCG() {
    // Table header (includes the Size and Label Pos columns)
    const thead = document.getElementById('bcg-tbody').parentElement.querySelector('thead');
    thead.innerHTML = '<tr><th>Entity</th><th>Relative Market Share (X: 0-1)</th><th>Industry Growth Rate (Y: -20 to +20)</th><th>Size</th><th>Label Pos</th></tr>';

    document.getElementById('bcg-toggle').onclick = () => {
        document.getElementById('bcg-container').classList.toggle('show-reference');
    };

    document.getElementById('bcg-tbody').addEventListener('input', e => {
        if (e.target.classList.contains('bcg-input')) {
            state.entitiesData[e.target.dataset.idx].bcg[e.target.dataset.field] =
                e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            renderBCGChart();
        }
    });

    bindThemeControls({
        themeSelectId: 'bcg-theme',
        getTheme: () => state.appThemes.bcg,
        presets: BCG_PRESETS,
        inputMap: BCG_INPUT_MAP,
        onChange: renderBCGChart
    });
}
