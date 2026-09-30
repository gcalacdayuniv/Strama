import { state } from '../state.js';
import { BCG_PRESETS } from '../defaults.js';
import { createBubble, posOptions, syncThemeInputs, bindThemeControls } from '../utils.js';

const BCG_INPUT_MAP = {
    'bcg-bg-color': 'bg',
    'bcg-text-color': 'text',
    'bcg-line-color': 'line'
};

/* ---------- Quadrant drawings (line art, shown in Reference view) ---------- */
const SVG_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">';
const STAR_PTS = '0,-10 2.35,-3.24 9.51,-3.09 3.8,1.24 5.88,8.09 0,4 -5.88,8.09 -3.8,1.24 -9.51,-3.09 -2.35,-3.24';
const QMARK = '<path d="M-6 -6a6 6 0 1 1 9 5c-3 2-3 4-3 7"/><circle cx="0" cy="12" r="1" fill="currentColor"/>';

const BCG_ICONS = [
    { // Stars (quadrant II)
        side: 'icon-right',
        svg: SVG_OPEN
            + `<polygon points="${STAR_PTS}" transform="translate(22 30) scale(1.5)"/>`
            + `<polygon points="${STAR_PTS}" transform="translate(46 38) scale(1.2)"/>`
            + `<polygon points="${STAR_PTS}" transform="translate(30 52) scale(0.7)"/></svg>`
    },
    { // Question Marks (quadrant I)
        side: 'icon-left',
        svg: SVG_OPEN
            + `<g transform="translate(20 24) scale(1.1)">${QMARK}</g>`
            + `<g transform="translate(46 22) scale(0.8) rotate(12)">${QMARK}</g>`
            + `<g transform="translate(38 46) scale(0.8) rotate(-10)">${QMARK}</g></svg>`
    },
    { // Cash Cows (quadrant III)
        side: 'icon-right',
        svg: SVG_OPEN
            + '<rect x="16" y="24" width="34" height="18" rx="6"/>'
            + '<rect x="4" y="22" width="14" height="14" rx="4"/>'
            + '<path d="M7 22l-2-6M15 22l2-6"/>'
            + '<path d="M21 42v12M27 42v12M39 42v12M45 42v12"/>'
            + '<path d="M50 28q7 2 5 12"/>'
            + '<circle cx="9" cy="28" r="1" fill="currentColor"/>'
            + '<path d="M28 30q4-2 6 2q-2 4-6 2z"/></svg>'
    },
    { // Dogs (quadrant IV)
        side: 'icon-right',
        svg: SVG_OPEN
            + '<rect x="18" y="28" width="30" height="14" rx="6"/>'
            + '<circle cx="14" cy="24" r="8"/>'
            + '<path d="M8 18q-5 6 0 12"/>'
            + '<path d="M6 26h-3"/>'
            + '<path d="M22 42v12M28 42v12M40 42v12M45 42v12"/>'
            + '<path d="M48 30q8-4 8-14"/>'
            + '<circle cx="15" cy="22" r="1" fill="currentColor"/></svg>'
    }
];

function injectQuadrantIcons() {
    document.querySelectorAll('#bcg-container .bcg-quadrant').forEach((quad, i) => {
        const icon = BCG_ICONS[i];
        if (!icon || quad.querySelector('.bcg-quad-icon')) return;
        const div = document.createElement('div');
        div.className = `bcg-quad-icon ${icon.side}`;
        div.innerHTML = icon.svg;
        quad.appendChild(div);
    });
}

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

    injectQuadrantIcons();

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
