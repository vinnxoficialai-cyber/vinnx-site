/**
 * Solution Animations — Stats countUp, Service cards stagger, Feature grid stagger,
 * Benefits stagger, Process steps sequential, Testimonials stagger, Final CTA reveal
 */
export function initSolutionAnims() {
    if (!('IntersectionObserver' in window)) return;

    // ---- Stats bar countUp + stagger ----
    const statsBar = document.getElementById('statsBar');
    if (statsBar) {
        observeOnce(statsBar, 0.3, () => {
            statsBar.classList.add('in');
            statsBar.querySelectorAll('.stat-number').forEach((el) => {
                const target = parseFloat(el.dataset.target) || 0;
                const isDecimal = el.dataset.decimal === 'true';
                countUp(el, target, 1600, isDecimal);
            });
        });
    }

    // ---- Service cards stagger reveal ----
    staggerReveal('#servicesGrid', '.service-card', 100, 'in-view');

    // ---- Feature cards stagger reveal ----
    staggerReveal('#featureGrid', '.feature-card-v2', 100, 'in-view');

    // ---- Benefit blocks stagger ----
    staggerReveal('#whyChoose .why-benefits', '.benefit-block', 180, 'in');

    // ---- Process steps sequential + timeline ----
    const timeline = document.getElementById('processTimeline');
    if (timeline) {
        observeOnce(timeline, 0.2, () => {
            timeline.classList.add('in');
            timeline.querySelectorAll('.process-step').forEach((step, i) => {
                setTimeout(() => step.classList.add('in'), i * 250);
            });
        });
    }

    // ---- Testimonial cards stagger ----
    staggerReveal('#testimonialGrid', '.testimonial-card', 150, 'in');

    // ---- Final CTA reveal ----
    const cta = document.querySelector('.final-cta');
    if (cta) {
        observeOnce(cta, 0.2, () => {
            cta.classList.add('in');
        });
    }
}

/* ---------- Helpers ---------- */

/** Observe an element once and fire a callback when visible */
function observeOnce(el, threshold, callback) {
    const obs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    obs.unobserve(entry.target);
                    callback(entry.target);
                }
            });
        },
        { threshold }
    );
    obs.observe(el);
}

/** Stagger-reveal children of a container */
function staggerReveal(containerSelector, childSelector, delayMs, className) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    observeOnce(container, 0.15, () => {
        container.querySelectorAll(childSelector).forEach((child, i) => {
            setTimeout(() => child.classList.add(className), i * delayMs);
        });
    });
}

/* ---------- CountUp ---------- */
function countUp(el, target, duration, isDecimal = false) {
    const start = performance.now();
    const format = (n) => {
        if (isDecimal) return n.toFixed(1).replace('.', ',');
        return n.toLocaleString('pt-BR');
    };

    function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        // ease-out quad
        const ease = 1 - (1 - t) * (1 - t);
        const current = isDecimal ? ease * target : Math.round(ease * target);
        el.textContent = format(current);
        if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}
