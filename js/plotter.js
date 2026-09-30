import { request } from './api.js';
import { state } from './state.js';
import {
    createDefaultThemes, createDefaultSMData, createDefaultPorters, DEFAULT_PORTERS,
    GE_PRESETS, GS_PRESETS, BCG_PRESETS, SPACE_PRESETS, SM_PRESETS, PORTERS_PRESETS
} from './defaults.js';
import { clone, resolveThemeColors } from './utils.js';
import { initDownloads } from './download.js';
import { buildEntitiesTable, initEntities } from './charts/entities.js';
import { buildGETable, renderGEChart, applyGETheme, initGE } from './charts/ge.js';
import { buildGSTable, renderGSChart, applyGSTheme, initGS } from './charts/gs.js';
import { buildBCGTable, renderBCGChart, applyBCGTheme, initBCG } from './charts/bcg.js';
import { buildSpaceTable, renderSpaceChart, applySpaceTheme, initSpace } from './charts/space.js';
import { buildSMTable, renderSMChart, updateSMUI, applySMTheme, initSM } from './charts/strategyMap.js';
import { buildPortersTable, renderPortersChart, applyPortersTheme, initPorters } from './charts/porters.js';

const GE_KEYS = ['axis', 'invest', 'maintain', 'divest'];
const GS_KEYS = ['bg', 'text', 'line'];
const BCG_KEYS = ['bg', 'text', 'line'];
const SPACE_KEYS = ['bg', 'text', 'line'];

export function initPlotter() {
    initEntities();
    initGE();
    initGS();
    initBCG();
    initSpace();
    initSM();
    initPorters();
    initDownloads();
}

// Legacy projects saved as 'custom' with no stored custom set: keep their saved colors as the custom set
function seedCustomIfEmpty(theme, keys) {
    if (theme.preset === 'custom' && Object.keys(theme.custom).length === 0) {
        keys.forEach(k => { theme.custom[k] = theme[k]; });
    }
}

// Rebuild active colors from the saved preset. Presets are temporary; 'custom' reads the saved custom data.
function applySavedThemes() {
    const t = state.appThemes;

    seedCustomIfEmpty(t.ge, GE_KEYS);
    seedCustomIfEmpty(t.gs, GS_KEYS);
    seedCustomIfEmpty(t.bcg, BCG_KEYS);
    seedCustomIfEmpty(t.space, SPACE_KEYS);
    resolveThemeColors(t.ge, GE_PRESETS, GE_KEYS);
    resolveThemeColors(t.gs, GS_PRESETS, GS_KEYS);
    resolveThemeColors(t.bcg, BCG_PRESETS, BCG_KEYS);
    resolveThemeColors(t.space, SPACE_PRESETS, SPACE_KEYS);

    // Strategy Map
    const sm = state.smData;
    if (t.sm.preset === 'custom') {
        if (Object.keys(sm.customColors).length === 0) sm.customColors = clone(sm.colors);
        sm.colors = { ...SM_PRESETS.orange, ...sm.customColors };
    } else if (SM_PRESETS[t.sm.preset]) {
        sm.colors = clone(SM_PRESETS[t.sm.preset]);
    }

    // Porter's 5 Forces
    const pt = t.porters;
    if (pt.preset === 'custom') {
        if (pt.custom.length !== 5) pt.custom = state.portersData.map(p => ({ bg: p.bg, color: p.color }));
        state.portersData.forEach((p, i) => {
            p.bg = pt.custom[i].bg;
            p.color = pt.custom[i].color;
        });
    } else if (PORTERS_PRESETS[pt.preset]) {
        state.portersData.forEach((p, i) => {
            p.bg = PORTERS_PRESETS[pt.preset].bg[i];
            p.color = PORTERS_PRESETS[pt.preset].color[i];
        });
    }
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
    if (!t.bcg) t.bcg = { preset: 'orange', ...BCG_PRESETS.orange, custom: {} };
    if (!t.bcg.custom) t.bcg.custom = {};
    if (!t.space.custom) t.space.custom = {};
    if (!t.sm) t.sm = { preset: 'orange' };
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
            : { xVal: 4.5, yVal: 4.5, size: 30, pos: 'top' }),
        bcg: item.bcg || { xVal: 0.5, yVal: 0, size: 30, pos: 'top' }
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
    if (!state.smData.colors) state.smData.colors = clone(SM_PRESETS.orange);

    applySavedThemes();
    applyThemesToUI();
    renderAll();
}

function applyThemesToUI() {
    applyGETheme();
    applyGSTheme();
    applyBCGTheme();
    applySpaceTheme();
    applySMTheme();
    applyPortersTheme();
}

export function renderAll() {
    buildEntitiesTable();
    buildGETable(); renderGEChart();
    buildGSTable(); renderGSChart();
    buildBCGTable(); renderBCGChart();
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
