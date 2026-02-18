/**
 * Scroll Reveal — Generic IntersectionObserver for below-fold elements
 */
export function initScrollReveal() {
    // Observe all elements with data-reveal or specific IDs
    const revealIds = ['statsShowcase', 'txSection', 'servicesGrid', 'phonesShowcase', 'whyChoose', 'processTimeline', 'featureGrid', 'shieldShowcase', 'testimonialGrid'];
    const revealTargets = new Set();

    revealIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) revealTargets.add(el);
    });

    // Also observe any element with .reveal class that hasn't been animated yet
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => {
        // Skip elements that are part of the hero (they have their own timeline)
        if (!el.closest('.hero')) {
            revealTargets.add(el);
        }
    });

    if (!revealTargets.size) return;

    // Fallback for old browsers/devices where IntersectionObserver is unavailable.
    if (!('IntersectionObserver' in window)) {
        revealTargets.forEach((target) => target.classList.add('in'));
        return;
    }

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
}
