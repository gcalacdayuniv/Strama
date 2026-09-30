import { clone } from './utils.js';

/* ---------- Theme presets ---------- */
export const GE_PRESETS = {
    orange: { invest: '#ffe0b2', maintain: '#ffb74d', divest: '#f57c00', axis: '#d84315' },
    bw: { invest: '#ffffff', maintain: '#ffffff', divest: '#ffffff', axis: '#000000' }
};
export const GS_PRESETS = {
    orange: { bg: '#fff3e0', text: '#212121', line: '#d84315' },
    bw: { bg: '#ffffff', text: '#000000', line: '#000000' }
};
export const BCG_PRESETS = {
    orange: { bg: '#ffe0b2', text: '#212121', line: '#d84315' },
    bw: { bg: '#ffffff', text: '#000000', line: '#000000' }
};
export const IE_PRESETS = {
    orange: { grow: '#c8e6c9', hold: '#ffe0b2', harvest: '#ffccbc', text: '#212121', line: '#000000' },
    bw: { grow: '#ffffff', hold: '#e0e0e0', harvest: '#9e9e9e', text: '#000000', line: '#000000' }
};
export const SPACE_PRESETS = {
    orange: { bg: '#fff3e0', text: '#212121', line: '#d84315' },
    bw: { bg: '#ffffff', text: '#000000', line: '#000000' }
};
export const SM_PRESETS = {
    orange: { mvBg: "#fff3e0", mvColor: "#212121", finBg: "#ffb74d", finColor: "#212121", cusBg: "#f57c00", cusColor: "#ffffff", intBg: "#e65100", intColor: "#ffffff", lrnBg: "#bf360c", lrnColor: "#ffffff" },
    bw: { mvBg: "#ffffff", mvColor: "#000000", finBg: "#333333", finColor: "#ffffff", cusBg: "#555555", cusColor: "#ffffff", intBg: "#777777", intColor: "#ffffff", lrnBg: "#999999", lrnColor: "#ffffff" }
};
export const PORTERS_PRESETS = {
    orange: {
        bg: ['#ff9800', '#ffb74d', '#f57c00', '#fb8c00', '#e65100'],
        color: ['#ffffff', '#212121', '#ffffff', '#ffffff', '#ffffff']
    },
    bw: {
        bg: ['#666666', '#999999', '#444444', '#777777', '#222222'],
        color: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']
    }
};

/* ---------- Factories ---------- */
export function createDefaultThemes() {
    return {
        ge: { preset: 'orange', ...GE_PRESETS.orange, custom: {} },
        gs: { preset: 'orange', ...GS_PRESETS.orange, custom: {} },
        bcg: { preset: 'orange', ...BCG_PRESETS.orange, custom: {} },
        ie: { preset: 'orange', ...IE_PRESETS.orange, custom: {} },
        space: { preset: 'orange', ...SPACE_PRESETS.orange, custom: {} },
        sm: { preset: 'orange' },
        porters: { preset: 'orange', custom: [] }
    };
}

export function createDefaultSMData() {
    return { mission: "", vision: "", objectives: [], colors: clone(SM_PRESETS.orange), customColors: {} };
}

export const DEFAULT_PORTERS = [
    { id: 'substitutes', title: 'Potential Development of<br>Substitute Products', rating: 'Moderate', bg: '#ff9800', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>' },
    { id: 'entrants', title: 'Potential Entry of<br>New Competitors', rating: 'Moderate', bg: '#ffb74d', color: '#212121', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>' },
    { id: 'suppliers', title: 'Bargaining Power<br>of Suppliers', rating: 'Moderate', bg: '#f57c00', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V11l6 4v-4l6 4V4h5v17z"/><path d="M7 18h1"/><path d="M11 18h1"/><path d="M17 8h1"/><path d="M17 12h1"/></svg>' },
    { id: 'consumers', title: 'Bargaining Power<br>of Consumers', rating: 'Moderate', bg: '#fb8c00', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>' },
    { id: 'rivalry', title: 'Rivalry Among<br>Competing Firms', rating: 'Moderate', bg: '#e65100', color: '#ffffff', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12V9a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v4a5 5 0 0 1-5 5H9a3 3 0 0 1-3-3z"/><path d="M6 13h4a2 2 0 0 0 2-2V8"/><path d="M9 18v4h5v-4"/></svg>' }
];

export function createDefaultPorters() {
    return clone(DEFAULT_PORTERS);
}
