/**
 * Hero Timeline - Orchestrates the intro animation sequence
 */
export function initHeroTimeline() {
    const titleEl = document.getElementById('heroTitle');
    if (!titleEl) return;
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    const leftCard = document.getElementById('cardLeft');
    const centerCard = document.getElementById('cardCenter');
    const rightCard = document.getElementById('cardRight');
    const fanContainer = document.getElementById('fanContainer');

    [leftCard, centerCard, rightCard].forEach((card) => {
        if (card) card.classList.add('fan-animate-start');
    });

    // Split title into word spans
    const titleLines = [
        ['Seu', ' Negócio'],
        ['com ', 'Inteligência', ' Artificial'],
    ];

    const allWordSpans = [];

    titleLines.forEach((line) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'hero-title-line';

        line.forEach((word) => {
            const span = document.createElement('span');
            span.classList.add('title-word');
            const trimmed = word.trim();
            if (trimmed === 'Negócio' || trimmed === 'Inteligência' || trimmed === 'Artificial') {
                span.classList.add('highlight');
            }
            span.textContent = word;
            lineDiv.appendChild(span);
            allWordSpans.push(span);
        });

        titleEl.appendChild(lineDiv);
    });

    // Animation timeline (ms from page load)
    const WORD_STAGGER = 130;
    const CARD_STAGGER = isMobile ? 95 : 130;
    const CARD_SETTLE_DELAY = isMobile ? 650 : 900;
    const T = {
        titleStart: 400,
        navIn: 1600,
        badgeIn: 2000,
        cardFanIn: 2100,
        subtitleIn: 2400,
        ctaIn: 3400,
        ambientIn: 1200,
    };

    const COUNTUP_PROFILE = {
        fastPhaseShare: 0.46,
        slowPhaseShare: 0.54,
        integerSmartRatio: 0.03,
        integerSmartMin: 90,
        integerSmartMax: 14000,
        decimalSmartRatio: 0.1,
        decimalSmartMin: 1.1,
        decimalSmartMax: 6,
        tailFadeThreshold: 0.68,
        tailPhaseTarget: 0.965,
        tailPhasePower: 5.5,
        revenueDuration: 1900,
        kpiDuration: 1450,
        metricDuration: 1650,
        staggerAdvanceMs: 80,
        contentLeadMs: 260,
    };

    // 1. Title words - staggered reveal
    allWordSpans.forEach((span, i) => {
        setTimeout(() => span.classList.add('word-in'), T.titleStart + i * WORD_STAGGER);
    });

    // 2. Navigation slides in
    setTimeout(() => {
        const nav = document.getElementById('mainNav');
        if (nav) nav.classList.add('nav-in');
    }, T.navIn);

    // 3. Badge
    setTimeout(() => {
        const badge = document.getElementById('heroBadge');
        if (badge) badge.classList.add('in');
    }, T.badgeIn);

    let fanEntrancePlayed = false;
    function playFanEntrance() {
        if (fanEntrancePlayed) return;
        fanEntrancePlayed = true;

        const sequence = isMobile
            ? [centerCard, leftCard, rightCard]
            : [leftCard, centerCard, rightCard];

        sequence.forEach((card, index) => {
            if (!card) return;
            setTimeout(() => {
                card.classList.add('card-in');
                card.classList.remove('fan-animate-start');
            }, index * CARD_STAGGER);
        });
    }

    // 4. Cards fan-in with device-specific cadence
    setTimeout(() => {
        if (fanContainer && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        playFanEntrance();
                        observer.disconnect();
                    }
                },
                { threshold: 0.15 }
            );
            observer.observe(fanContainer);
        } else {
            playFanEntrance();
        }
    }, T.cardFanIn);

    // 5. Subtitle
    setTimeout(() => {
        const sub = document.getElementById('heroSubtitle');
        if (sub) sub.classList.add('in');
    }, T.subtitleIn);

    // 6. Fallback in case observer never intersects
    setTimeout(() => {
        playFanEntrance();
    }, T.cardFanIn + 1400);

    // 7. Card content animations - staggered internal reveals
    const T_CONTENT = T.cardFanIn + (CARD_STAGGER * 2) + Math.max(220, CARD_SETTLE_DELAY - COUNTUP_PROFILE.contentLeadMs);

    // CountUp helper with smart-easing: fast linear phase + strong expo brake.
    function countUp(el, target, prefix = '', suffix = '', duration = 1800) {
        if (!el || el.dataset.countupDone === '1' || el.dataset.countupRunning === '1') return;
        el.dataset.countupRunning = '1';
        const start = performance.now();
        const isDecimal = String(target).includes('.');
        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
        const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
        const absoluteTarget = Math.abs(target);
        const direction = target >= 0 ? 1 : -1;
        const rawSmartAmount = isDecimal
            ? Math.round(absoluteTarget * COUNTUP_PROFILE.decimalSmartRatio * 10) / 10
            : Math.round(absoluteTarget * COUNTUP_PROFILE.integerSmartRatio);
        const smartAmount = isDecimal
            ? clamp(rawSmartAmount, COUNTUP_PROFILE.decimalSmartMin, COUNTUP_PROFILE.decimalSmartMax)
            : clamp(rawSmartAmount, COUNTUP_PROFILE.integerSmartMin, COUNTUP_PROFILE.integerSmartMax);
        const slowPhaseStart = target - (direction * smartAmount);
        const fastDuration = duration * COUNTUP_PROFILE.fastPhaseShare;
        const slowDuration = duration * COUNTUP_PROFILE.slowPhaseShare;
        let lastDisplayed = direction >= 0 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

        const toDisplayValue = (value) => (isDecimal ? Number(value.toFixed(1)) : Math.round(value));
        const keepMonotonic = (value) => {
            if (direction >= 0) {
                lastDisplayed = Math.max(lastDisplayed, value);
            } else {
                lastDisplayed = Math.min(lastDisplayed, value);
            }
            return lastDisplayed;
        };
        const formatValue = (value) => (isDecimal
            ? String(value.toFixed(1)).replace('.', ',')
            : value.toLocaleString('pt-BR'));

        function tick(now) {
            const elapsed = now - start;
            const isDone = elapsed >= duration;

            let currentValue;
            if (elapsed <= fastDuration) {
                const progress = clamp(elapsed / fastDuration, 0, 1);
                currentValue = slowPhaseStart * progress;
            } else {
                const progress = clamp((elapsed - fastDuration) / slowDuration, 0, 1);
                const fadeThreshold = COUNTUP_PROFILE.tailFadeThreshold;
                const tailTarget = COUNTUP_PROFILE.tailPhaseTarget;
                let fadedProgress;
                if (progress < fadeThreshold) {
                    const p = clamp(progress / fadeThreshold, 0, 1);
                    fadedProgress = easeOutExpo(p) * tailTarget;
                } else {
                    const p = clamp((progress - fadeThreshold) / (1 - fadeThreshold), 0, 1);
                    const tail = 1 - Math.pow(1 - p, COUNTUP_PROFILE.tailPhasePower);
                    fadedProgress = tailTarget + ((1 - tailTarget) * tail);
                }
                currentValue = slowPhaseStart + ((target - slowPhaseStart) * fadedProgress);
            }

            let numericValue = toDisplayValue(currentValue);
            numericValue = keepMonotonic(numericValue);
            if (isDone) numericValue = toDisplayValue(target);

            el.textContent = prefix + formatValue(numericValue) + suffix;

            if (!isDone) {
                requestAnimationFrame(tick);
            } else {
                el.dataset.countupRunning = '0';
                el.dataset.countupDone = '1';
            }
        }

        requestAnimationFrame(tick);
    }

    setTimeout(() => {
        const left = document.getElementById('cardLeft');
        const right = document.getElementById('cardRight');
        if (left) left.classList.add('card-animated');
        if (right) right.classList.add('card-animated');

        // Left card: stagger chart bars (60ms each, left to right)
        if (left) {
            left.querySelectorAll('.chart-bar').forEach((bar, i) => {
                bar.style.animationDelay = `${i * 60}ms`;
            });
        }

        // Left card: revenue block delay
        if (left) {
            const rev = left.querySelector('.revenue-block');
            if (rev) rev.style.animationDelay = '0ms';
            const badge = left.querySelector('.growth-badge');
            if (badge) badge.style.animationDelay = '400ms';
        }

        // Left card: stagger KPI items (150ms each)
        if (left) {
            left.querySelectorAll('.kpi-item').forEach((item, i) => {
                item.style.animationDelay = `${600 + i * 150}ms`;
            });
        }

        // Right card: app header first
        if (right) {
            const header = right.querySelector('.app-header');
            if (header) header.style.animationDelay = '0ms';
        }

        // Right card: stagger metric rows (120ms each, top to bottom)
        if (right) {
            right.querySelectorAll('.metric-row').forEach((row, i) => {
                row.style.animationDelay = `${300 + i * 120}ms`;
            });
        }

        // === CountUp animations ===

        // Left card: Revenue R$ 0 â†’ R$ 247.850
        const revEl = document.querySelector('[data-countup="revenue"]');
        if (revEl) countUp(revEl, 247850, 'R$ ', '', COUNTUP_PROFILE.revenueDuration);

        // Left card: KPIs (staggered start)
        const vendasEl = document.querySelector('[data-countup="vendas"]');
        if (vendasEl) {
            setTimeout(
                () => countUp(vendasEl, 1842, '', '', COUNTUP_PROFILE.kpiDuration),
                600 - COUNTUP_PROFILE.staggerAdvanceMs
            );
        }

        const aprovEl = document.querySelector('[data-countup="aprovacao"]');
        if (aprovEl) {
            setTimeout(
                () => countUp(aprovEl, 94.7, '', '%', COUNTUP_PROFILE.kpiDuration),
                750 - COUNTUP_PROFILE.staggerAdvanceMs
            );
        }

        const ticketEl = document.querySelector('[data-countup="ticket"]');
        if (ticketEl) {
            setTimeout(
                () => countUp(ticketEl, 134, 'R$ ', '', COUNTUP_PROFILE.kpiDuration),
                900 - COUNTUP_PROFILE.staggerAdvanceMs
            );
        }

        // Right card: metrics (staggered)
        const usersEl = document.querySelector('[data-countup="usuarios"]');
        if (usersEl) {
            setTimeout(
                () => countUp(usersEl, 12.4, '', 'k', COUNTUP_PROFILE.metricDuration),
                300 - COUNTUP_PROFILE.staggerAdvanceMs
            );
        }

        const receitaEl = document.querySelector('[data-countup="receita"]');
        if (receitaEl) {
            setTimeout(
                () => countUp(receitaEl, 89, 'R$ ', 'k', COUNTUP_PROFILE.metricDuration),
                420 - COUNTUP_PROFILE.staggerAdvanceMs
            );
        }

        const convEl = document.querySelector('[data-countup="conversao"]');
        if (convEl) {
            setTimeout(
                () => countUp(convEl, 8.2, '', '%', COUNTUP_PROFILE.metricDuration),
                540 - COUNTUP_PROFILE.staggerAdvanceMs
            );
        }
    }, T_CONTENT);

    // 8. CTA
    setTimeout(() => {
        const cta = document.getElementById('heroCta');
        if (cta) cta.classList.add('in');
    }, T.ctaIn);

    // Ambient glow
    setTimeout(() => {
        const glow = document.getElementById('ambientGlow');
        if (glow) glow.classList.add('active');
    }, T.ambientIn);
}

