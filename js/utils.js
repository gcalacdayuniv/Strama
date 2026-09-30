export const clone = (obj) => JSON.parse(JSON.stringify(obj));

export function hexToRgba(hex, alphaPercent) {
    if (!hex) return `rgba(255, 255, 255, ${alphaPercent / 100})`;
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g}, ${b},${Math.max(0, Math.min(1, alphaPercent / 100)).toFixed(2)})`;
}

// <option> list for label position selects
export function posOptions(selected) {
    return [['top', 'Top'], ['bottom', 'Bot'], ['left', 'Left'], ['right', 'Right']]
        .map(([v, t]) => `<option value="${v}" ${selected === v ? 'selected' : ''}>${t}</option>`)
        .join('');
}

// Shared bubble + label builder (GE, GS, SPACE)
export function createBubble({ name, size, color, labelColor, pos, left, top }) {
    const el = document.createElement('div');
    el.className = 'bubble';
    el.style.width = (size / 700 * 100) + '%';
    el.style.aspectRatio = '1 / 1';
    el.style.backgroundColor = color || '#f57c00';
    el.style.left = left + '%';
    el.style.top = top + '%';

    const label = document.createElement('div');
    label.className = 'bubble-label label-' + (pos || 'top');
    label.textContent = name;
    label.style.color = labelColor || '#ffffff';
    label.style.textShadow = '0px 0px 2px rgba(0,0,0,0.5)';
    label.style.backgroundColor = hexToRgba(color || '#f57c00', 70);

    el.appendChild(label);
    return el;
}

/* ---------- Generic theme helpers (GE, GS, SPACE) ---------- */
// inputMap: { inputElementId: themeKey }
export function syncThemeInputs(themeSelectId, theme, inputMap) {
    document.getElementById(themeSelectId).value = theme.preset;
    Object.entries(inputMap).forEach(([id, key]) => {
        document.getElementById(id).value = theme[key];
    });
}

export function bindThemeControls({ themeSelectId, getTheme, presets, inputMap, onChange }) {
    document.getElementById(themeSelectId).addEventListener('change', e => {
        const theme = getTheme();
        const preset = e.target.value;
        theme.preset = preset;

        if (presets[preset]) {
            Object.assign(theme, presets[preset]);
        } else if (preset === 'custom' && theme.custom && Object.keys(theme.custom).length > 0) {
            Object.values(inputMap).forEach(key => { theme[key] = theme.custom[key] || theme[key]; });
        }

        Object.entries(inputMap).forEach(([id, key]) => {
            document.getElementById(id).value = theme[key];
        });
        onChange();
    });

    Object.entries(inputMap).forEach(([id, key]) => {
        document.getElementById(id).addEventListener('input', e => {
            const theme = getTheme();
            document.getElementById(themeSelectId).value = 'custom';
            theme.preset = 'custom';
            if (!theme.custom) theme.custom = {};
            theme[key] = e.target.value;
            theme.custom[key] = e.target.value;
            onChange();
        });
    });
}
