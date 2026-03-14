/**
 * Button Open Feedback - premium click response for pricing/addon CTAs.
 * Adds arrow affordance + "Abrindo..." transition on click.
 */

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function normalizeLabel(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
}

function decorateButton(button) {
    if (!button || button.dataset.openFxReady === 'true') return;

    const label = normalizeLabel(button.textContent);
    if (!label) return;

    button.dataset.openFxReady = 'true';
    button.classList.add('btn-openfx');
    button.innerHTML = `
        <span class="btn-open-label">${label}</span>
        <span class="btn-open-status" aria-hidden="true">Abrindo...</span>
        <span class="btn-open-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
            </svg>
        </span>
    `;

    button.addEventListener('click', () => {
        if (button.classList.contains('is-opening')) return;

        button.classList.add('is-opening');
        const duration = prefersReducedMotion() ? 180 : 740;

        window.setTimeout(() => {
            button.classList.remove('is-opening');
        }, duration);
    });
}

export function initButtonOpenFeedback() {
    const buttons = document.querySelectorAll('.pricing-card .btn-primary, .addon-card .btn-primary');
    if (!buttons.length) return;

    buttons.forEach((button) => decorateButton(button));
}

