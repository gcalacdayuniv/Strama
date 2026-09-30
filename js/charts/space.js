import { state } from '../state.js';
import { SPACE_PRESETS } from '../defaults.js';
import { createBubble, posOptions, syncThemeInputs, bindThemeControls } from '../utils.js';

const SPACE_INPUT_MAP = {
    'space-bg-color': 'bg',
    'space-text-color': 'text',
    'space-line-color': 'line'
};

export function buildSpaceTable() {
    const tbody = document.getElementById('space-tbody'); tbody.innerHTML = '';
    if (!state.spaceData.length) { tbody.innerHTML = '<tr><td colspan="8">No Entities added.</td></tr>'; return; }
    state.spaceData.forEach((sbu, i) => {
        const nm = sbu.name || '';
        const xV = sbu.xVal !== undefined ? sbu.xVal : 3.0;
        const yV = sbu.yVal !== undefined ? sbu.yVal : 3.0;
        const sz = sbu.size || 30;
        const col = sbu.color || '#f57c00';
        const lblCol = sbu.labelColor || '#ffffff';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${nm}" data-idx="${i}" data-field="name" class="space-input"></td>
            <td><input type="number" min="-7" max="7" step="0.01" value="${xV}" data-idx="${i}" data-field="xVal" class="space-input"></td>
            <td><input type="number" min="-7" max="7" step="0.01" value="${yV}" data-idx="${i}" data-field="yVal" class="space-input"></td>
            <td><input type="number" min="10" max="100" value="${sz}" data-idx="${i}" data-field="size" class="space-input"></td>
            <td><input type="color" value="${col}" data-idx="${i}" data-field="color" class="space-input"></td>
            <td><input type="color" value="${lblCol}" data-idx="${i}" data-field="labelColor" class="space-input"></td>
            <td><select data-idx="${i}" data-field="pos" class="space-input">${posOptions(sbu.pos)}</select></td>
            <td><button class="btn-delete" data-idx="${i}">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTicks() {
    const ticksContainer = document.getElementById('space-ticks');
    if (ticksContainer.innerHTML !== '') return;
    let ticks = '';
    for (let i = -7; i <= 7; i++) {
        if (i === 0) continue;
        const posPct = 50 + (i / 14) * 100;
        ticks += `<div class="space-tick-x" style="left: ${posPct}%;"></div>`;
        ticks += `<div class="space-tick-label-x" style="left: ${posPct}%;">${i}</div>`;

        const topPosPct = 50 - (i / 14) * 100;
        ticks += `<div class="space-tick-y" style="top: ${topPosPct}%;"></div>`;
        ticks += `<div class="space-tick-label-y" style="top: ${topPosPct}%;">${i}</div>`;
    }
    ticksContainer.innerHTML = ticks;
}

export function renderSpaceChart() {
    const plotArea = document.getElementById('space-plot-area');
    const svgOverlay = document.getElementById('space-svg-overlay');
    plotArea.innerHTML = '';

    renderTicks();

    let svgHtml = ``;
    state.spaceData.forEach((sbu, i) => {
        svgHtml += `
        <defs>
            <marker id="arrowhead-space-${i}" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <polygon points="0 0, 8 4, 0 8" fill="${sbu.color || '#f57c00'}" />
            </marker>
        </defs>`;
    });

    state.spaceData.forEach((sbu, i) => {
        const xVal = Math.max(-7, Math.min(7, sbu.xVal !== undefined ? sbu.xVal : 3.0));
        const yVal = Math.max(-7, Math.min(7, sbu.yVal !== undefined ? sbu.yVal : 3.0));

        let ratio = 1;
        const vectorLen = Math.sqrt(xVal * xVal + yVal * yVal);
        if (vectorLen > 0) ratio = (vectorLen + 1.25) / vectorLen;

        const endXPct = 50 + ((xVal * ratio) / 14) * 100;
        const endYPct = 50 - ((yVal * ratio) / 14) * 100;
        const leftPct = 50 + (xVal / 14) * 100;
        const topPct = 50 - (yVal / 14) * 100;

        svgHtml += `<line x1="50%" y1="50%" x2="${endXPct}%" y2="${endYPct}%" stroke="${sbu.color || '#f57c00'}" stroke-width="2.5" marker-end="url(#arrowhead-space-${i})" />`;

        plotArea.appendChild(createBubble({
            name: sbu.name, size: sbu.size, color: sbu.color, labelColor: sbu.labelColor, pos: sbu.pos,
            left: leftPct, top: topPct
        }));
    });

    svgOverlay.innerHTML = `<svg width="100%" height="100%" style="overflow: visible;">${svgHtml}</svg>`;

    const sp = state.appThemes.space;
    document.documentElement.style.setProperty('--space-bg', sp.bg);
    document.documentElement.style.setProperty('--space-text-color', sp.text);
    document.documentElement.style.setProperty('--space-line-color', sp.line);
}

export function applySpaceTheme() {
    syncThemeInputs('space-theme', state.appThemes.space, SPACE_INPUT_MAP);
}

export function initSpace() {
    document.getElementById('space-toggle').onclick = () => {
        document.getElementById('space-container').classList.toggle('show-reference');
    };

    document.getElementById('space-add').onclick = () => {
        state.spaceData.push({ name: "New Entity", xVal: 3.0, yVal: 3.0, size: 30, color: "#f57c00", labelColor: "#ffffff", pos: "top" });
        buildSpaceTable(); renderSpaceChart();
    };

    document.getElementById('space-clear').onclick = () => {
        state.spaceData = [];
        buildSpaceTable(); renderSpaceChart();
    };

    document.getElementById('space-tbody').addEventListener('input', e => {
        if (e.target.classList.contains('space-input')) {
            state.spaceData[e.target.dataset.idx][e.target.dataset.field] =
                e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            renderSpaceChart();
        }
    });

    document.getElementById('space-tbody').addEventListener('click', e => {
        if (e.target.classList.contains('btn-delete')) {
            state.spaceData.splice(e.target.dataset.idx, 1);
            buildSpaceTable(); renderSpaceChart();
        }
    });

    bindThemeControls({
        themeSelectId: 'space-theme',
        getTheme: () => state.appThemes.space,
        presets: SPACE_PRESETS,
        inputMap: SPACE_INPUT_MAP,
        onChange: renderSpaceChart
    });
}
