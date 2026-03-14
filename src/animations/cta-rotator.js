/**
 * Final CTA text rotator.
 * Uses a single rendered node to avoid text overlap between transitions.
 */

const HOLD_MS = 3600;
const EXIT_MS = 520;

export function initCtaRotator() {
    const wordsRoot = document.querySelector('.btn-cta-large .btn-cta-words');
    if (!wordsRoot) return;

    const phrases = Array.from(wordsRoot.querySelectorAll('span'))
        .map((node) => node.textContent?.trim() ?? '')
        .filter(Boolean);

    if (!phrases.length) return;

    const current = document.createElement('span');
    current.className = 'btn-cta-current';
    current.textContent = phrases[0];
    wordsRoot.replaceChildren(current);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (phrases.length < 2 || reducedMotion.matches) return;

    let index = 0;
    let holdTimer = 0;
    let exitTimer = 0;
    let rafA = 0;
    let rafB = 0;

    const cancelPending = () => {
        if (holdTimer) {
            window.clearTimeout(holdTimer);
            holdTimer = 0;
        }
        if (exitTimer) {
            window.clearTimeout(exitTimer);
            exitTimer = 0;
        }
        if (rafA) {
            window.cancelAnimationFrame(rafA);
            rafA = 0;
        }
        if (rafB) {
            window.cancelAnimationFrame(rafB);
            rafB = 0;
        }
    };

    const schedule = () => {
        holdTimer = window.setTimeout(() => {
            current.classList.add('is-leaving');

            exitTimer = window.setTimeout(() => {
                index = (index + 1) % phrases.length;
                current.textContent = phrases[index];
                current.classList.remove('is-leaving');
                current.classList.add('is-pre-enter');

                rafA = window.requestAnimationFrame(() => {
                    rafB = window.requestAnimationFrame(() => {
                        current.classList.remove('is-pre-enter');
                    });
                });

                schedule();
            }, EXIT_MS);
        }, HOLD_MS);
    };

    const stop = () => {
        cancelPending();
        current.classList.remove('is-leaving', 'is-pre-enter');
    };

    const start = () => {
        if (document.hidden || reducedMotion.matches) return;
        stop();
        schedule();
    };

    const onVisibilityChange = () => {
        if (document.hidden) {
            stop();
            return;
        }
        start();
    };

    const onMotionChange = () => {
        if (reducedMotion.matches) {
            stop();
            return;
        }
        start();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', onMotionChange);
    } else if (typeof reducedMotion.addListener === 'function') {
        reducedMotion.addListener(onMotionChange);
    }

    window.addEventListener('pagehide', stop, { once: true });

    start();
}
