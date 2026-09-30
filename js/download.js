const dlConfig = { quality: 0.95, backgroundColor: '#ffffff' };

const downloads = [
    { btn: 'ge-dl', chart: 'ge-chart', file: 'GE_Matrix.jpeg' },
    { btn: 'gs-dl', chart: 'gs-chart', file: 'GS_Matrix.jpeg' },
    { btn: 'space-dl', chart: 'space-chart', file: 'SPACE_Matrix.jpeg' },
    { btn: 'sm-dl', chart: 'sm-chart', file: 'Strategy_Map.jpeg' },
    { btn: 'porters-dl', chart: 'porters-chart', file: 'Porters_Five_Forces.jpeg' }
];

export function initDownloads() {
    downloads.forEach(({ btn, chart, file }) => {
        const button = document.getElementById(btn);
        if (!button) return;
        button.onclick = () => {
            htmlToImage.toJpeg(document.getElementById(chart), dlConfig).then(dataUrl => {
                const link = document.createElement('a');
                link.download = file;
                link.href = dataUrl;
                link.click();
            });
        };
    });
}
