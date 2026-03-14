const SPLINE_SCENE_URL = 'https://prod.spline.design/xDJZruhxHvGUafMH/scene.splinecode';
const SPLINE_TAG_NAME = 'spline-viewer';

let viewerModulePromise = null;

function ensureViewerRegistered() {
    if (customElements.get(SPLINE_TAG_NAME)) {
        return Promise.resolve();
    }

    if (!viewerModulePromise) {
        viewerModulePromise = import('@splinetool/viewer');
    }

    return viewerModulePromise;
}

function mountViewer(mountContainer) {
    const viewer = document.createElement(SPLINE_TAG_NAME);
    viewer.setAttribute('url', SPLINE_SCENE_URL);
    viewer.setAttribute('loading-anim-type', 'spinner-small-dark');
    viewer.setAttribute('background', 'transparent');
    viewer.setAttribute('events-target', 'global');
    viewer.setAttribute('aria-label', 'Cena 3D interativa da VINNX');
    viewer.style.display = 'block';
    viewer.style.width = '100%';
    viewer.style.height = '100%';
    mountContainer.replaceChildren(viewer);
    return viewer;
}

export function initFooterSpline() {
    const mountContainer = document.getElementById('splineViewerMount');
    if (!mountContainer) return;
    if (mountContainer.dataset.initialized === 'true') return;
    mountContainer.dataset.initialized = 'true';

    ensureViewerRegistered()
        .then(() => {
            const viewer = mountViewer(mountContainer);

            viewer.addEventListener('load', () => {
                mountContainer.dataset.loaded = 'true';
                
                // Hide watermark via shadow DOM injection
                setTimeout(() => {
                    try {
                        const style = document.createElement('style');
                        style.textContent = `
                            #logo, .spline-watermark { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }
                        `;
                        if (viewer.shadowRoot) {
                            viewer.shadowRoot.appendChild(style);
                        }
                    } catch(e) {}
                }, 100);
            }, { once: true });

            viewer.addEventListener('error', (event) => {
                console.error('[spline] viewer reported an error while loading the scene.', event);
            });
        })
        .catch((error) => {
            console.error('[spline] failed to register the viewer web component.', error);
            mountContainer.dataset.initialized = 'error';
        });
}
