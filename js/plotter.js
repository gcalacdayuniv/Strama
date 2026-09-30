import { request } from './api.js';
import { state } from './state.js';
import { createDefaultThemes, createDefaultSMData, createDefaultPorters, DEFAULT_PORTERS } from './defaults.js';
import { initDownloads } from './download.js';
import { buildEntitiesTable, initEntities } from './charts/entities.js';
import { buildGETable, renderGEChart, applyGETheme, initGE } from './charts/ge.js';
import { buildGSTable, renderGSChart, applyGSTheme, initGS } from './charts/gs.js';
import { buildSpaceTable, renderSpaceChart, applySpaceTheme, initSpace } from './charts/space.js';
import { buildSMTable, renderSMChart, updateSMUI, applySMTheme, initSM } from './charts/strategyMap.js';
import { buildPortersTable, renderPortersChart, applyPortersTheme, initPorters } from './charts/porters.js';

export function initPlotter() {
    initEntities();
    initGE();
    initGS();
    initSpace();
    initSM();
    initPorters();
    initDownloads();
}

export function loadProjectIntoEditor(project) {
    const rawGE = project.ge_data ? JSON.parse(project.ge_data) : [];

    let rawGS = project.gs_data ? JSON.parse(project.gs_data) : [];
    if (!Array.isArray(rawGS) && rawGS.ge) {
        state.appThemes = rawGS;
        rawGS = [];
    } else {
        state.appThemes = createDefaultThemes();
    }

    const t = state.appThemes;
    if (!t.ge.custom) t.ge.custom = {};
    if (!t.gs.custom) t.gs.custom = {};
    if (!t.space.custom) t.space.custom = {};
    if (!t.porters) t.porters = { preset: 'orange', custom: [] };
    if (!t.porters.custom) t.porters.custom = [];

    state.entitiesData = rawGE.map((item, i) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || "SBU",
        color: item.color || "#f57c00",
        labelColor: item.labelColor || "#ffffff",
        ge: item.ge || { attr: item.attr || 3.0, comp: item.comp || 3.0, size: item.size || 30, pos: item.pos || 'top' },
        gs: item.gs || (rawGS[i]
            ? { xVal: rawGS[i].xVal || 4.5, yVal: rawGS[i].yVal || 4.5, size: rawGS[i].size || 30, pos: rawGS[i].pos || 'top' }
            : { xVal: 4.5, yVal: 4.5, size: 30, pos: 'top' })
    }));

    state.spaceData = project.space_data ? JSON.parse(project.space_data) : [];
    state.smData = project.sm_data ? JSON.parse(project.sm_data) : createDefaultSMData();
    state.portersData = project.porters_data ? JSON.parse(project.porters_data) : createDefaultPorters();

    // Always refresh icons from defaults so saved projects pick up updated SVGs
    state.portersData.forEach(p => {
        const def = DEFAULT_PORTERS.find(d => d.id === p.id);
        if (def) p.icon = def.icon;
    });

    if (!state.smData.customColors) state.smData.customColors = {};

    applyThemesToUI();
    renderAll();
}

function applyThemesToUI() {
    applyGETheme();
    applyGSTheme();
    applySpaceTheme();
    applySMTheme();
    applyPortersTheme();
}

export function renderAll() {
    buildEntitiesTable();
    buildGETable(); renderGEChart();
    buildGSTable(); renderGSChart();
    buildSpaceTable(); renderSpaceChart();
    buildSMTable(); renderSMChart(); updateSMUI();
    buildPortersTable(); renderPortersChart();
}

export async function saveCurrentProject() {
    try {
        const title = document.getElementById('editor-project-title').innerText;
        await request(`/projects/${state.currentProjectId}`, 'PUT', {
            name: title,
            ge_data: state.entitiesData,
            gs_data: state.appThemes,
            space_data: state.spaceData,
            sm_data: state.smData,
            porters_data: state.portersData
        });
        alert('Project saved successfully');
    } catch (e) { alert(e.message); }
}
