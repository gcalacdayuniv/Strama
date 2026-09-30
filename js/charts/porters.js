import { state } from '../state.js';
import { PORTERS_PRESETS, createDefaultPorters } from '../defaults.js';

export function buildPortersTable() {
    const tbody = document.getElementById('porters-tbody'); tbody.innerHTML = '';
    state.portersData.forEach((force, i) => {
        const sel = (v) => force.rating === v ? 'selected' : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:bold; font-size:12px;">${force.id.toUpperCase()}</td>
            <td><select data-idx="${i}" data-field="rating" class="porters-input">
                <option value="Low" ${sel('Low')}>Low</option>
                <option value="Moderate" ${sel('Moderate')}>Moderate</option>
                <option value="High" ${sel('High')}>High</option>
            </select></td>
            <td><input type="color" value="${force.bg}" data-idx="${i}" data-field="bg" class="porters-input"></td>
            <td><input type="color" value="${force.color}" data-idx="${i}" data-field="color" class="porters-input"></td>
        `;
        tbody.appendChild(tr);
    });
}

export function renderPortersChart() {
    const container = document.getElementById('porters-container'); container.innerHTML = '';
    state.portersData.forEach(force => {
        const el = document.createElement('div');
        el.className = `porters-force ${force.id}`;
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
            points += `${center + r * Math.sin(angle)},${center - r * Math.cos(angle)} `;
        }
        svg += `<polygon points="${points.trim()}" fill="none" stroke="#e2e8f0" stroke-width="1.5" />`;
        svg += `<text x="${center}" y="${center - r}" font-size="14" fill="#94a3b8" text-anchor="middle" dy="-6">${level}</text>`;
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
        const force = state.portersData.find(f => f.id === forceId);
        const score = ratingMap[force.rating] || 1;
        const r = (maxRadius / 5) * score;
        const angle = (Math.PI * 2 * i / 5);
        dataPoints += `${center + r * Math.sin(angle)},${center - r * Math.cos(angle)} `;

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

    const primaryRadarColor = state.portersData.find(f => f.id === 'rivalry').bg || '#f57c00';
    svg += `<polygon points="${dataPoints.trim()}" fill="${primaryRadarColor}25" stroke="${primaryRadarColor}" stroke-width="2.5" />`;

    forceOrder.forEach((forceId, i) => {
        const force = state.portersData.find(f => f.id === forceId);
        const score = ratingMap[force.rating] || 1;
        const r = (maxRadius / 5) * score;
        const angle = (Math.PI * 2 * i / 5);
        svg += `<circle cx="${center + r * Math.sin(angle)}" cy="${center - r * Math.cos(angle)}" r="6" fill="${primaryRadarColor}" />`;
    });

    svg += `</svg>`;
    radarContainer.innerHTML = svg;
}

export function applyPortersTheme() {
    document.getElementById('porters-theme').value = state.appThemes.porters.preset;
}

export function initPorters() {
    document.getElementById('porters-toggle').onclick = () => {
        document.getElementById('porters-chart').classList.toggle('show-radar');
    };

    document.getElementById('porters-theme').addEventListener('change', e => {
        const preset = e.target.value;
        const themes = state.appThemes.porters;
        themes.preset = preset;

        if (PORTERS_PRESETS[preset]) {
            state.portersData.forEach((p, i) => {
                p.bg = PORTERS_PRESETS[preset].bg[i];
                p.color = PORTERS_PRESETS[preset].color[i];
            });
        } else if (preset === 'custom') {
            if (themes.custom && themes.custom.length === 5) {
                state.portersData.forEach((p, i) => {
                    p.bg = themes.custom[i].bg;
                    p.color = themes.custom[i].color;
                });
            }
        }
        buildPortersTable();
        renderPortersChart();
    });

    document.getElementById('porters-reset').onclick = () => {
        state.portersData = createDefaultPorters();
        state.appThemes.porters.preset = 'orange';
        document.getElementById('porters-theme').value = 'orange';
        buildPortersTable();
        renderPortersChart();
    };

    document.getElementById('porters-tbody').addEventListener('input', e => {
        if (e.target.classList.contains('porters-input')) {
            const themes = state.appThemes.porters;
            document.getElementById('porters-theme').value = 'custom';
            themes.preset = 'custom';
            state.portersData[e.target.dataset.idx][e.target.dataset.field] = e.target.value;

            if (!themes.custom || themes.custom.length < 5) {
                themes.custom = state.portersData.map(p => ({ bg: p.bg, color: p.color }));
            } else {
                themes.custom[e.target.dataset.idx][e.target.dataset.field] = e.target.value;
            }
            renderPortersChart();
        }
    });
}
