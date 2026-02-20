/**
 * Navbar - Mobile menu toggle
 */
export function initNavbar() {
    const hamburger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('navMobileMenu');
    const closeBtn = document.getElementById('navMobileClose');

    if (!hamburger || !mobileMenu) return;
    if (hamburger.dataset.initialized === 'true') return;
    hamburger.dataset.initialized = 'true';

    function openMenu() {
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

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    // Close on any menu action.
    mobileMenu.querySelectorAll('a, button').forEach((target) => {
        target.addEventListener('click', closeMenu);
    });

    // Close when tapping outside the content area.
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMenu();
        }
    });

    // Avoid stuck open menu when switching to desktop width.
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024 && mobileMenu.classList.contains('open')) {
            closeMenu();
        }
    });
}

