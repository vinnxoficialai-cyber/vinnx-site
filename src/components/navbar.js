/**
 * Navbar - Mobile menu toggle
 */
export function initNavbar() {
    const nav = document.getElementById('mainNav');
    const hamburger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('navMobileMenu');
    const backdrop = document.getElementById('navMobileBackdrop');
    const sheet = document.getElementById('navMobileSheet');

    if (!hamburger || !mobileMenu) return;
    if (hamburger.dataset.initialized === 'true') return;
    hamburger.dataset.initialized = 'true';

    function syncAnchorOffset() {
        if (!nav) return;
        const computed = window.getComputedStyle(nav);
        const top = parseFloat(computed.top) || 0;
        const height = nav.offsetHeight || 56;
        const gap = -44;
        const offset = Math.ceil(top + height + gap);
        document.documentElement.style.setProperty('--nav-anchor-offset', `${offset}px`);
    }

    function syncMenuPosition() {
        if (!nav || !sheet) return;
        const rect = nav.getBoundingClientRect();
        mobileMenu.style.setProperty('--nav-modal-left', `${Math.round(rect.left)}px`);
        mobileMenu.style.setProperty('--nav-modal-width', `${Math.round(rect.width)}px`);
        mobileMenu.style.setProperty('--nav-modal-top', `${Math.round(rect.bottom + 10)}px`);
    }

    function openMenu() {
        syncMenuPosition();
        mobileMenu.classList.add('open');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function toggleMenu() {
        if (mobileMenu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.addEventListener('click', toggleMenu);

    // Close on any menu action.
    mobileMenu.querySelectorAll('a, button').forEach((target) => {
        target.addEventListener('click', () => {
            const isMobileAction = target.classList.contains('navbar-mobile-action');

            if (isMobileAction) {
                target.classList.add('is-clicked');
                window.setTimeout(() => {
                    target.classList.remove('is-clicked');
                }, 320);

                window.setTimeout(closeMenu, 170);
                return;
            }

            closeMenu();
        });
    });

    // Close when tapping outside the content area.
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu || e.target === backdrop) {
            closeMenu();
        }
    });

    sheet?.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMenu();
        }
    });

    // Avoid stuck open menu when switching to desktop width.
    window.addEventListener('resize', () => {
        syncAnchorOffset();
        syncMenuPosition();
        if (window.innerWidth >= 1024 && mobileMenu.classList.contains('open')) {
            closeMenu();
        }
    });

    window.addEventListener('scroll', () => {
        if (!mobileMenu.classList.contains('open')) return;
        syncMenuPosition();
    }, { passive: true });

    syncAnchorOffset();
    window.addEventListener('load', syncAnchorOffset, { once: true });
    window.setTimeout(syncAnchorOffset, 0);
    window.setTimeout(syncAnchorOffset, 700);
}
