// Chart width (px) used for exports. Matches the chart panel on a ~1912px wide screen.
// Change this one number to make all exported images larger or smaller.
const EXPORT_WIDTH = 1020;

// Fixed pixel ratio so the output resolution is the same on every device (1020 x 2 = 2040px wide)
const EXPORT_PIXEL_RATIO = 2;

const dlConfig = { quality: 0.95, backgroundColor: '#ffffff', pixelRatio: EXPORT_PIXEL_RATIO };

const downloads = [
    { btn: 'ge-dl', chart: 'ge-chart', file: 'GE_Matrix.jpeg' },
    { btn: 'gs-dl', chart: 'gs-chart', file: 'GS_Matrix.jpeg' },
    { btn: 'bcg-dl', chart: 'bcg-chart', file: 'BCG_Matrix.jpeg' },
    { btn: 'space-dl', chart: 'space-chart', file: 'SPACE_Matrix.jpeg' },
    { btn: 'sm-dl', chart: 'sm-chart', file: 'Strategy_Map.jpeg' },
    { btn: 'porters-dl', chart: 'porters-chart', file: 'Porters_Five_Forces.jpeg' }
];

async function exportChart(chartId, fileName) {
    const original = document.getElementById(chartId);

    // Offscreen wrapper with a fixed width; the chart is cloned into it so the
    // visible layout is never touched. Chart sizes use cqi units, so they scale with this width.
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `position:fixed; left:-99999px; top:0; width:${EXPORT_WIDTH}px; pointer-events:none;`;

    const clone = original.cloneNode(true);
    clone.style.width = EXPORT_WIDTH + 'px';
    clone.style.maxWidth = 'none';
    clone.style.flex = 'none';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
        const dataUrl = await htmlToImage.toJpeg(clone, dlConfig);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
    } catch (e) {
        alert('Image export failed: ' + e.message);
    } finally {
        wrapper.remove();
    }
}

export function initDownloads() {
    downloads.forEach(({ btn, chart, file }) => {
        const button = document.getElementById(btn);
        if (!button) return;
        button.onclick = () => exportChart(chart, file);
    });
}
