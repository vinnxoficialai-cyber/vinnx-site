/**
 * Fan Cards - Scroll spread effect
 */
export function initFanCards() {
    const fanContainer = document.getElementById('fanContainer');
    const cardsSection = document.getElementById('cardsSection');
    if (!fanContainer || !cardsSection) return;

    let ticking = false;

    function handleScroll() {
        const sectionRect = cardsSection.getBoundingClientRect();
        const viewportH = window.innerHeight;

        // Skip expensive transform updates while section is far from viewport.
        if (sectionRect.bottom < -120 || sectionRect.top > viewportH + 120) {
            ticking = false;
            return;
        }

        const scrollY = window.scrollY;
        const windowH = viewportH;
        const isMobile = window.innerWidth < 1024;

        const scrollStart = isMobile ? 50 : 100;
        const scrollEnd = isMobile ? windowH * 0.5 : windowH * 0.7;
        const progress = Math.max(0, Math.min(1, (scrollY - scrollStart) / (scrollEnd - scrollStart)));

        if (progress > 0) {
            fanContainer.classList.add('scroll-spread');
            const spreadMultiplier = isMobile ? 0.6 : 1;
            const spread = progress * 120 * spreadMultiplier;
            const rot = progress * 5 * spreadMultiplier;
            const yUp = progress * -15 * spreadMultiplier;

            fanContainer.style.setProperty('--spread', spread + 'px');
            fanContainer.style.setProperty('--spread-rot', rot + 'deg');
            fanContainer.style.setProperty('--spread-y', yUp + 'px');
        } else {
            fanContainer.classList.remove('scroll-spread');
            fanContainer.style.removeProperty('--spread');
            fanContainer.style.removeProperty('--spread-rot');
            fanContainer.style.removeProperty('--spread-y');
        }

        ticking = false;
    }

    function requestFrameUpdate() {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestFrameUpdate, { passive: true });
    window.addEventListener('resize', requestFrameUpdate);
    requestFrameUpdate();
}

