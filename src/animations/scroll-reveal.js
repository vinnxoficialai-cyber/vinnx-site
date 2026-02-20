/**
 * Scroll Reveal - Cinematic scroll animations (mobile-first)
 * Features: staggered reveal, scale-in blur, counter animation, parallax
 */

const isMobile = () => window.innerWidth <= 768;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* â”€â”€â”€ Staggered Reveal â”€â”€â”€ */
function initStaggeredReveal() {
    const containers = document.querySelectorAll(
        '.services-grid, .offer-grid, .feature-grid-v2, .pricing-grid, .addons-grid, .testimonials-grid, .shield-metrics, .why-v2-cards, .bento-grid-solutions'
    );

    if (!containers.length) return;

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const children = entry.target.querySelectorAll(
                    '.service-card, .offer-card, .feature-card-v2, .pricing-card, .addon-card, .testimonial-card, .shield-metric-card, .why-adv-card, .sol-card'
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

/* â”€â”€â”€ Scale-in Blur (sections focus as they enter) â”€â”€â”€ */
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

/* â”€â”€â”€ Counter Animation â”€â”€â”€ */
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

    // Parse number - handle both . and , as decimal
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

/* â”€â”€â”€ Parallax (subtle depth effect) â”€â”€â”€ */
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

/* â”€â”€â”€ Heading reveal (kicker â†’ h2 â†’ p stagger) â”€â”€â”€ */
function initHeadingReveal() {
    const headings = document.querySelectorAll('.section-heading-block, .ai-header-v2, .why-v2-header, .final-cta-inner');

    if (!headings.length) return;

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const kicker = entry.target.querySelector('.offer-kicker');
                const h2 = entry.target.querySelector('h2');
                const p = entry.target.querySelector('p');

                const delay = isMobile() ? 110 : 140;

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
        { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );

    headings.forEach((h) => io.observe(h));
}

/* â”€â”€â”€ Mobile Card Scroll-Expand (Spotlight) â”€â”€â”€ */
function initServiceCardExpand() {
    if (window.innerWidth > 1023) return;

    const cards = Array.from(document.querySelectorAll(
        '.services-grid .service-card'
    ));
    if (!cards.length) return;

    const states = cards.map((card) => ({
        card,
        current: { opacity: 0.56, blur: 1, y: 8, scale: 0.97, brightness: 0.82 },
        target: { opacity: 0.56, blur: 1, y: 8, scale: 0.97, brightness: 0.82 }
    }));

    let activeCard = null;
    let rafId = null;
    let needsMeasure = true;

    function setTargets() {
        // Sweet spot: slightly below center for a cinematic "rack focus" feel.
        const target = window.innerHeight * 0.62;
        const maxEffectDistance = Math.max(window.innerHeight * 0.58, 260);
        let closest = null;
        let closestDist = Infinity;
        const metrics = [];

        for (const state of states) {
            const rect = state.card.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const dist = Math.abs(center - target);

            // Only consider cards that are at least partially visible
            const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
            const proximity = isVisible
                ? Math.max(0, Math.min(1, 1 - dist / maxEffectDistance))
                : 0;

            state.target.opacity = 0.36 + proximity * 0.64;
            state.target.blur = (1 - proximity) * 2.2;
            state.target.y = (1 - proximity) * 12;
            state.target.scale = 0.958 + proximity * 0.042;
            state.target.brightness = 0.72 + proximity * 0.28;

            metrics.push({ state, dist, isVisible, proximity });

            if (isVisible && dist < closestDist) {
                closestDist = dist;
                closest = state.card;
            }
        }

        // Hysteresis to prevent rapid focus swapping between adjacent cards.
        if (activeCard) {
            const activeMetric = metrics.find((m) => m.state.card === activeCard);
            if (
                activeMetric &&
                activeMetric.isVisible &&
                activeMetric.dist <= closestDist + 24
            ) {
                closest = activeCard;
            }
        }

        if (closest !== activeCard) {
            if (activeCard) activeCard.classList.remove('service-expanded');
            if (closest) closest.classList.add('service-expanded');
            activeCard = closest;
        }

        metrics.forEach(({ state, proximity }) => {
            const isNear = state.card !== closest && proximity >= 0.46;
            state.card.classList.toggle('service-near', isNear);
        });
    }

    function animate() {
        if (needsMeasure) {
            setTargets();
            needsMeasure = false;
        }

        let keepAnimating = false;
        const smooth = 0.22;

        for (const state of states) {
            const { current, target, card } = state;

            current.opacity += (target.opacity - current.opacity) * smooth;
            current.blur += (target.blur - current.blur) * smooth;
            current.y += (target.y - current.y) * smooth;
            current.scale += (target.scale - current.scale) * smooth;
            current.brightness += (target.brightness - current.brightness) * smooth;

            card.style.setProperty('--service-focus-opacity', current.opacity.toFixed(3));
            card.style.setProperty('--service-focus-blur', `${current.blur.toFixed(2)}px`);
            card.style.setProperty('--service-focus-y', `${current.y.toFixed(1)}px`);
            card.style.setProperty('--service-focus-scale', current.scale.toFixed(3));
            card.style.setProperty('--service-focus-brightness', current.brightness.toFixed(3));

            if (
                Math.abs(target.opacity - current.opacity) > 0.004 ||
                Math.abs(target.blur - current.blur) > 0.02 ||
                Math.abs(target.y - current.y) > 0.08 ||
                Math.abs(target.scale - current.scale) > 0.002 ||
                Math.abs(target.brightness - current.brightness) > 0.003
            ) {
                keepAnimating = true;
            }
        }

        if (needsMeasure || keepAnimating) {
            rafId = requestAnimationFrame(animate);
            return;
        }

        rafId = null;
    }

    function requestUpdate() {
        needsMeasure = true;
        if (rafId === null) {
            rafId = requestAnimationFrame(animate);
        }
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    // Initial check
    requestUpdate();
}

/* â”€â”€â”€ Main init â”€â”€â”€ */
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

