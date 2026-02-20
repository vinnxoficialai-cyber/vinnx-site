/**
 * Scroll Reveal — Cinematic scroll animations (mobile-first)
 * Features: staggered reveal, scale-in blur, counter animation, parallax
 */

const isMobile = () => window.innerWidth <= 768;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Staggered Reveal ─── */
function initStaggeredReveal() {
    const containers = document.querySelectorAll(
        '.services-grid, .offer-grid, .feature-grid-v2, .pricing-grid, .testimonials-grid, .shield-metrics, .cinematic-stack, .bento-grid-solutions'
    );

    if (!containers.length) return;

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const children = entry.target.querySelectorAll(
                    '.service-card, .offer-card, .feature-card-v2, .pricing-card, .testimonial-card, .shield-metric-card, .benefit-block, .sol-card'
                );

                const baseDelay = isMobile() ? 60 : 80;

                children.forEach((child, i) => {
                    child.style.transitionDelay = `${i * baseDelay}ms`;
                    child.classList.add('stagger-in');
                });

                io.unobserve(entry.target);
            });
        },
        { threshold: 0.08 }
    );

    containers.forEach((c) => io.observe(c));
}

/* ─── Scale-in Blur (sections focus as they enter) ─── */
function initScaleBlurReveal() {
    const sections = document.querySelectorAll('.reveal:not(.hero *)');

    if (!sections.length) return;

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );

    sections.forEach((el) => {
        if (!el.closest('.hero')) {
            io.observe(el);
        }
    });
}

/* ─── Counter Animation ─── */
function animateCounter(el) {
    // Support data-counter attribute for explicit targetss
    if (el.dataset.counter) {
        const target = parseInt(el.dataset.counter, 10);
        if (isNaN(target) || target === 0) return;

        const prefix = el.dataset.prefix || '';
        const separator = el.dataset.separator || '';
        const duration = isMobile() ? 1200 : 1800;
        const startTime = performance.now();

        function formatWithSep(n) {
            const str = Math.round(n).toString();
            if (!separator) return str;
            return str.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        }

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            el.textContent = prefix + formatWithSep(current);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = prefix + formatWithSep(target);
            }
        }

        requestAnimationFrame(step);
        return;
    }

    const text = el.textContent.trim();
    const match = text.match(/^([^\d]*)([0-9,.]+)(%|s|x|\/\d+)?(.*)$/);
    if (!match) return;

    const prefix = match[1];
    const numStr = match[2];
    const suffix = (match[3] || '') + (match[4] || '');
    const hasDecimal = numStr.includes('.');
    const hasComma = numStr.includes(',');

    // Parse number — handle both . and , as decimal
    let target;
    if (hasComma && !hasDecimal) {
        // Brazilian format: 4.900 or 99,9
        target = parseFloat(numStr.replace('.', '').replace(',', '.'));
    } else {
        target = parseFloat(numStr.replace(',', ''));
    }

    if (isNaN(target) || target === 0) return;

    const duration = isMobile() ? 1200 : 1800;
    const startTime = performance.now();
    const decimals = hasComma ? (numStr.split(',')[1] || '').length : (hasDecimal ? (numStr.split('.')[1] || '').length : 0);

    function formatNum(n) {
        if (hasComma) {
            // Brazilian format
            const parts = n.toFixed(decimals).split('.');
            return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (decimals > 0 ? ',' + parts[1] : '');
        }
        return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        el.textContent = prefix + formatNum(current) + suffix;

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = prefix + formatNum(target) + suffix;
        }
    }

    requestAnimationFrame(step);
}

function initCounterAnimations() {
    const counterEls = document.querySelectorAll(
        '.shield-metric-card strong, .stats-number, .pricing-value, [data-counter]'
    );

    if (!counterEls.length) return;

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    counterEls.forEach((el) => io.observe(el));
}

/* ─── Parallax (subtle depth effect) ─── */
function initParallax() {
    if (prefersReducedMotion() || isMobile()) return;

    const parallaxEls = document.querySelectorAll('[data-parallax]');
    // Also apply subtle parallax to section heading kickers
    const kickers = document.querySelectorAll('.offer-kicker');

    const allEls = [...parallaxEls, ...kickers];
    if (!allEls.length) return;

    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;
        const viewH = window.innerHeight;

        allEls.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const elCenter = rect.top + rect.height / 2;
            const offset = (elCenter - viewH / 2) / viewH;
            const speed = parseFloat(el.dataset.parallax) || 0.04;
            const yShift = offset * speed * viewH * -1;

            el.style.transform = `translateY(${yShift.toFixed(1)}px)`;
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateParallax);
        }
    }, { passive: true });
}

/* ─── Heading reveal (kicker → h2 → p stagger) ─── */
function initHeadingReveal() {
    const headings = document.querySelectorAll('.section-heading-block, .ai-header-v2, .why-heading-cinematic');

    if (!headings.length) return;

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const kicker = entry.target.querySelector('.offer-kicker');
                const h2 = entry.target.querySelector('h2');
                const p = entry.target.querySelector('p');

                const delay = isMobile() ? 80 : 120;

                if (kicker) {
                    kicker.style.transitionDelay = '0ms';
                    kicker.classList.add('heading-reveal-in');
                }
                if (h2) {
                    h2.style.transitionDelay = `${delay}ms`;
                    h2.classList.add('heading-reveal-in');
                }
                if (p) {
                    p.style.transitionDelay = `${delay * 2}ms`;
                    p.classList.add('heading-reveal-in');
                }

                io.unobserve(entry.target);
            });
        },
        { threshold: 0.15 }
    );

    headings.forEach((h) => io.observe(h));
}

/* ─── Mobile Card Scroll-Expand (Spotlight) ─── */
function initServiceCardExpand() {
    if (window.innerWidth > 1023) return;

    const cards = Array.from(document.querySelectorAll(
        '.services-grid .service-card, .why-cinematic .scene-card'
    ));
    if (!cards.length) return;

    let ticking = false;
    let activeCard = null;

    function updateSpotlight() {
        // Sweet spot: just above the bottom of the viewport (~75%)
        const target = window.innerHeight * 0.65;
        let closest = null;
        let closestDist = Infinity;

        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const dist = Math.abs(center - target);

            // Only consider cards that are at least partially visible
            if (rect.bottom > 0 && rect.top < window.innerHeight && dist < closestDist) {
                closestDist = dist;
                closest = card;
            }
        }

        if (closest !== activeCard) {
            if (activeCard) activeCard.classList.remove('service-expanded');
            if (closest) closest.classList.add('service-expanded');
            activeCard = closest;
        }

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateSpotlight);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial check
    updateSpotlight();
}

/* ─── Main init ─── */
export function initScrollReveal() {
    if (prefersReducedMotion()) {
        // Just show everything immediately
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
        return;
    }

    initScaleBlurReveal();
    initStaggeredReveal();
    initCounterAnimations();
    initParallax();
    initHeadingReveal();
    initServiceCardExpand();
}
