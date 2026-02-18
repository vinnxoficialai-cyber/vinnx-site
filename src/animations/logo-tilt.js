/**
 * Logo 3D Tilt — Interactive mouse-follow tilt effect
 * When the mouse approaches an edge of the card, the logo tilts
 * toward that direction as if it were a 3D object.
 */
export function initLogoTilt() {
    const card = document.getElementById('cardCenter');
    if (!card) return;

    const logo = card.querySelector('.card-3d-logo');
    const glow = card.querySelector('.card-3d-glow');
    if (!logo) return;

    const MAX_TILT = 20; // degrees

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();

        // Normalize mouse position to -1 → +1 range
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        // RotateY follows X axis (left/right), RotateX follows inverted Y axis (up/down)
        const tiltY = x * MAX_TILT;
        const tiltX = -y * MAX_TILT;

        logo.classList.add('tilting');
        logo.style.setProperty('--tilt-x', tiltX + 'deg');
        logo.style.setProperty('--tilt-y', tiltY + 'deg');

        // Move glow toward mouse for a dynamic lighting feel
        if (glow) {
            const glowX = 50 + x * 20;
            const glowY = 50 + y * 20;
            glow.style.left = glowX + '%';
            glow.style.top = glowY + '%';
        }
    });

    card.addEventListener('mouseleave', () => {
        // Smoothly reset tilt
        logo.classList.remove('tilting');
        logo.style.setProperty('--tilt-x', '0deg');
        logo.style.setProperty('--tilt-y', '0deg');

        // Reset glow
        if (glow) {
            glow.style.left = '50%';
            glow.style.top = '50%';
        }
    });
}
