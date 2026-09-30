import { state } from '../state.js';
import { SM_PRESETS } from '../defaults.js';
import { clone, hexToRgba } from '../utils.js';

const SM_COLOR_IDS = ['sm-mv-bg', 'sm-mv-color', 'sm-fin-bg', 'sm-fin-color', 'sm-cus-bg', 'sm-cus-color', 'sm-int-bg', 'sm-int-color', 'sm-lrn-bg', 'sm-lrn-color'];

export function buildSMTable() {
    const tbody = document.getElementById('sm-tbody'); tbody.innerHTML = '';
    const objectives = state.smData.objectives;
    if (!objectives || !objectives.length) { tbody.innerHTML = '<tr><td colspan="3">No objectives added.</td></tr>'; return; }
    objectives.forEach((obj, i) => {
        const sel = (v) => obj.perspective === v ? 'selected' : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><select data-idx="${i}" data-field="perspective" class="sm-input">
                <option value="fin" ${sel('fin')}>Financial</option>
                <option value="cus" ${sel('cus')}>Customer</option>
                <option value="int" ${sel('int')}>Internal Business</option>
                <option value="lrn" ${sel('lrn')}>Learning & Growth</option>
            </select></td>
            <td><input type="text" value="${obj.text || ''}" data-idx="${i}" data-field="text" class="sm-input"></td>
            <td><button class="btn-delete" data-idx="${i}" style="width: 100%;">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

export function renderSMChart() {
    ['fin', 'cus', 'int', 'lrn'].forEach(p => { document.getElementById(`sm-${p}-content`).innerHTML = ''; });

    if (state.smData.objectives) {
        state.smData.objectives.forEach(obj => {
            const el = document.createElement('div');
            el.className = 'sm-box';
            el.innerText = obj.text;
            const target = document.getElementById(`sm-${obj.perspective}-content`);
            if (target) target.appendChild(el);
        });
    }
}

export function updateSMUI() {
    const sm = state.smData;
    if (!sm.colors) sm.colors = clone(SM_PRESETS.orange);
    const c = sm.colors;

    document.getElementById('sm-mission-input').value = sm.mission || '';
    document.getElementById('sm-vision-input').value = sm.vision || '';
    document.querySelector('#sm-mission-display span').innerText = sm.mission || '';
    document.querySelector('#sm-vision-display span').innerText = sm.vision || '';

    document.getElementById('sm-mv-bg').value = c.mvBg; document.getElementById('sm-mv-color').value = c.mvColor;
    document.getElementById('sm-fin-bg').value = c.finBg; document.getElementById('sm-fin-color').value = c.finColor;
    document.getElementById('sm-cus-bg').value = c.cusBg; document.getElementById('sm-cus-color').value = c.cusColor;
    document.getElementById('sm-int-bg').value = c.intBg; document.getElementById('sm-int-color').value = c.intColor;
    document.getElementById('sm-lrn-bg').value = c.lrnBg; document.getElementById('sm-lrn-color').value = c.lrnColor;

    const root = document.documentElement;
    root.style.setProperty('--sm-mv-bg', c.mvBg); root.style.setProperty('--sm-mv-color', c.mvColor);
    root.style.setProperty('--sm-fin-bg', c.finBg); root.style.setProperty('--sm-fin-color', c.finColor);
    root.style.setProperty('--sm-cus-bg', c.cusBg); root.style.setProperty('--sm-cus-color', c.cusColor);
    root.style.setProperty('--sm-int-bg', c.intBg); root.style.setProperty('--sm-int-color', c.intColor);
    root.style.setProperty('--sm-lrn-bg', c.lrnBg); root.style.setProperty('--sm-lrn-color', c.lrnColor);

    root.style.setProperty('--sm-fin-light', hexToRgba(c.finBg, 12));
    root.style.setProperty('--sm-cus-light', hexToRgba(c.cusBg, 12));
    root.style.setProperty('--sm-int-light', hexToRgba(c.intBg, 12));
    root.style.setProperty('--sm-lrn-light', hexToRgba(c.lrnBg, 12));
}

export function applySMTheme() {
    document.getElementById('sm-theme').value = state.appThemes.sm.preset;
}

export function initSM() {
    document.getElementById('sm-add').onclick = () => {
        if (!state.smData.objectives) state.smData.objectives = [];
        state.smData.objectives.push({ perspective: "fin", text: "Increase revenue" });
        buildSMTable(); renderSMChart();
    };

    document.getElementById('sm-clear').onclick = () => {
        state.smData.objectives = [];
        buildSMTable(); renderSMChart();
    };

    document.getElementById('sm-tbody').addEventListener('input', e => {
        if (e.target.classList.contains('sm-input')) {
            state.smData.objectives[e.target.dataset.idx][e.target.dataset.field] = e.target.value;
            renderSMChart();
        }
    });

    document.getElementById('sm-tbody').addEventListener('click', e => {
        if (e.target.classList.contains('btn-delete')) {
            state.smData.objectives.splice(e.target.dataset.idx, 1);
            buildSMTable(); renderSMChart();
        }
    });

    ['sm-mission-input', 'sm-vision-input'].forEach(id => {
        document.getElementById(id).addEventListener('input', e => {
            const field = id.includes('mission') ? 'mission' : 'vision';
            state.smData[field] = e.target.value;
            document.querySelector(`#sm-${field}-display span`).innerText = e.target.value;
        });
    });

    document.getElementById('sm-theme').addEventListener('change', e => {
        const preset = e.target.value;
        state.appThemes.sm.preset = preset;
        if (SM_PRESETS[preset]) {
            state.smData.colors = clone(SM_PRESETS[preset]);
        } else if (preset === 'custom') {
            if (state.smData.customColors && Object.keys(state.smData.customColors).length > 0) {
                state.smData.colors = clone(state.smData.customColors);
            }
        }
        updateSMUI();
    });

    SM_COLOR_IDS.forEach(id => {
        document.getElementById(id).addEventListener('input', e => {
            document.getElementById('sm-theme').value = 'custom';
            state.appThemes.sm.preset = 'custom';
            const key = id.replace('sm-', '').replace('-bg', 'Bg').replace('-color', 'Color');
            state.smData.colors[key] = e.target.value;

            if (!state.smData.customColors) state.smData.customColors = {};
            state.smData.customColors[key] = e.target.value;

            updateSMUI();
        });
    });
}
