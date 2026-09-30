// Injects the hamburger toggle for the editor tabs (visible in portrait only, via CSS)
export function initNav() {
    const nav = document.getElementById('nav-entities').parentElement;
    const header = nav.parentElement;
    const saveBtn = document.getElementById('btn-save-project');

    nav.id = 'editor-nav';

    const toggle = document.createElement('button');
    toggle.id = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';

    const actions = document.createElement('div');
    actions.className = 'editor-actions flex items-center gap-2';
    header.insertBefore(actions, nav);
    actions.append(nav, saveBtn, toggle);

    const setOpen = (open) => {
        nav.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.onclick = (e) => {
        e.stopPropagation();
        setOpen(!nav.classList.contains('open'));
    };

    // Close after choosing a tab
    nav.addEventListener('click', e => { if (e.target.closest('button')) setOpen(false); });

    // Close on outside click and when going back to the dashboard
    document.addEventListener('click', e => { if (!header.contains(e.target)) setOpen(false); });
    document.getElementById('btn-back-dashboard').addEventListener('click', () => setOpen(false));
}
