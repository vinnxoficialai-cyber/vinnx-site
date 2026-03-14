/**
 * FAQ accordion interactions with smooth height transition and accessible states.
 */

function setExpanded(item, expanded) {
    const button = item.querySelector('.faq-question');
    if (button) {
        button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
    item.classList.toggle('is-open', expanded);
}

function expandItem(item, reduceMotion) {
    const panel = item.querySelector('.faq-answer-wrap');
    const content = item.querySelector('.faq-answer');
    if (!panel || !content) return;

    setExpanded(item, true);
    panel.hidden = false;

    if (reduceMotion) {
        panel.dataset.faqState = 'open';
        panel.style.height = 'auto';
        panel.style.opacity = '1';
        return;
    }

    panel.dataset.faqState = 'opening';
    panel.style.height = '0px';
    panel.style.opacity = '0';
    panel.offsetHeight;
    panel.style.height = `${content.scrollHeight}px`;
    panel.style.opacity = '1';

    const onEnd = (event) => {
        if (event.propertyName !== 'height') return;
        panel.removeEventListener('transitionend', onEnd);
        if (panel.dataset.faqState !== 'opening') return;
        panel.dataset.faqState = 'open';
        panel.style.height = 'auto';
    };
    panel.addEventListener('transitionend', onEnd);
}

function collapseItem(item, reduceMotion) {
    const panel = item.querySelector('.faq-answer-wrap');
    if (!panel) return;

    setExpanded(item, false);

    if (reduceMotion) {
        panel.dataset.faqState = 'closed';
        panel.hidden = true;
        panel.style.height = '0px';
        panel.style.opacity = '0';
        return;
    }

    const startHeight = panel.scrollHeight;
    if (!startHeight) {
        panel.dataset.faqState = 'closed';
        panel.hidden = true;
        panel.style.height = '0px';
        panel.style.opacity = '0';
        return;
    }

    panel.dataset.faqState = 'closing';
    panel.style.height = `${startHeight}px`;
    panel.style.opacity = '1';
    panel.offsetHeight;
    panel.style.height = '0px';
    panel.style.opacity = '0';

    const onEnd = (event) => {
        if (event.propertyName !== 'height') return;
        panel.removeEventListener('transitionend', onEnd);
        if (panel.dataset.faqState !== 'closing') return;
        panel.dataset.faqState = 'closed';
        panel.hidden = true;
    };
    panel.addEventListener('transitionend', onEnd);
}

export function initFaqAccordion() {
    const items = Array.from(document.querySelectorAll('.faq-item'));
    if (!items.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncInitialState = (useReducedMotion) => {
        const initiallyOpen = items.find((item) => item.classList.contains('is-open')) || items[0];

        items.forEach((item) => {
            const panel = item.querySelector('.faq-answer-wrap');
            if (!panel) return;

            const shouldOpen = item === initiallyOpen;
            setExpanded(item, shouldOpen);

            if (shouldOpen) {
                panel.hidden = false;
                panel.dataset.faqState = 'open';
                panel.style.opacity = '1';
                panel.style.height = useReducedMotion ? 'auto' : `${panel.scrollHeight}px`;
                if (!useReducedMotion) {
                    requestAnimationFrame(() => {
                        panel.style.height = 'auto';
                    });
                }
            } else {
                panel.hidden = true;
                panel.dataset.faqState = 'closed';
                panel.style.height = '0px';
                panel.style.opacity = '0';
            }
        });
    };

    syncInitialState(reducedMotion.matches);

    items.forEach((item) => {
        const button = item.querySelector('.faq-question');
        if (!button) return;

        button.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            items.forEach((other) => {
                if (other !== item) {
                    collapseItem(other, reducedMotion.matches);
                }
            });

            if (isOpen) {
                collapseItem(item, reducedMotion.matches);
            } else {
                expandItem(item, reducedMotion.matches);
            }
        });
    });

    const onMotionChange = () => {
        syncInitialState(reducedMotion.matches);
    };

    if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', onMotionChange);
    } else if (typeof reducedMotion.addListener === 'function') {
        reducedMotion.addListener(onMotionChange);
    }
}
