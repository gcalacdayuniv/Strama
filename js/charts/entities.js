import { state } from '../state.js';
import { buildGETable, renderGEChart } from './ge.js';
import { buildGSTable, renderGSChart } from './gs.js';

function refreshLinkedViews() {
    buildGETable(); buildGSTable();
    renderGEChart(); renderGSChart();
}

export function buildEntitiesTable() {
    const tbody = document.getElementById('entities-tbody'); tbody.innerHTML = '';
    if (!state.entitiesData.length) { tbody.innerHTML = '<tr><td colspan="4">No Entities added.</td></tr>'; return; }
    state.entitiesData.forEach((sbu, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${sbu.name}" data-idx="${i}" data-field="name" class="entities-input"></td>
            <td><input type="color" value="${sbu.color}" data-idx="${i}" data-field="color" class="entities-input"></td>
            <td><input type="color" value="${sbu.labelColor}" data-idx="${i}" data-field="labelColor" class="entities-input"></td>
            <td><button class="btn-delete" data-idx="${i}">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

export function initEntities() {
    document.getElementById('entities-add').onclick = () => {
        state.entitiesData.push({
            id: crypto.randomUUID(), name: "New Entity", color: "#f57c00", labelColor: "#ffffff",
            ge: { attr: 3.0, comp: 3.0, size: 30, pos: "top" },
            gs: { xVal: 4.5, yVal: 4.5, size: 30, pos: "top" }
        });
        buildEntitiesTable(); refreshLinkedViews();
    };

    document.getElementById('entities-clear').onclick = () => {
        state.entitiesData = [];
        buildEntitiesTable(); refreshLinkedViews();
    };

    document.getElementById('entities-tbody').addEventListener('input', e => {
        if (e.target.classList.contains('entities-input')) {
            state.entitiesData[e.target.dataset.idx][e.target.dataset.field] = e.target.value;
            refreshLinkedViews();
        }
    });

    document.getElementById('entities-tbody').addEventListener('click', e => {
        if (e.target.classList.contains('btn-delete')) {
            state.entitiesData.splice(e.target.dataset.idx, 1);
            buildEntitiesTable(); refreshLinkedViews();
        }
    });
}
