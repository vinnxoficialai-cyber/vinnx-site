/**
 * Process Timeline - Cinematic scroll focus for mobile.
 * Highlights the step closest to the viewport focus line and
 * drives line progress through a CSS custom property.
 */
export function initProcessCinematic() {
    const timeline = document.getElementById('processTimeline');
    if (!timeline) return;

    const steps = Array.from(timeline.querySelectorAll('.process-step'));
    if (!steps.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    timeline.classList.add('process-cinematic-enabled');

    let ticking = false;
    let activeIndex = -1;

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    function setActiveStep(index) {
        if (index === activeIndex) return;
        activeIndex = index;
        steps.forEach((step, i) => {
            step.classList.toggle('is-active', i === index);
        });
    }

    function updateTimeline() {
        const vh = window.innerHeight || 1;
        const focusY = vh * 0.65;
        const rect = timeline.getBoundingClientRect();

        // Skip work when timeline is far from viewport.
        if (rect.bottom < 0 || rect.top > vh) {
            const offscreenProgress = rect.top > vh ? 0 : 1;
            timeline.style.setProperty('--process-scroll-progress', String(offscreenProgress));
            setActiveStep(-1);
            ticking = false;
            return;
        }

        const first = steps[0].getBoundingClientRect();
        const last = steps[steps.length - 1].getBoundingClientRect();
        const start = first.top + (first.height * 0.45);
        const end = last.top + (last.height * 0.55);
        const progress = clamp((focusY - start) / Math.max(1, end - start), 0, 1);
        timeline.style.setProperty('--process-scroll-progress', progress.toFixed(3));

        let nearest = -1;
        let nearestDist = Number.POSITIVE_INFINITY;
        steps.forEach((step, index) => {
            const stepRect = step.getBoundingClientRect();
            const center = stepRect.top + (stepRect.height * 0.5);
            const inBand = stepRect.bottom > vh * 0.12 && stepRect.top < vh * 0.9;
            if (!inBand) return;
            const dist = Math.abs(center - focusY);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = index;
            }
        });

        setActiveStep(nearest);
        ticking = false;
    }

    function requestUpdate() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateTimeline);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
}

