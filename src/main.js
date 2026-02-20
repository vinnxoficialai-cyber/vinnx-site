/**
 * Main entry point - imports styles and initializes all modules
 */

import { initHeroTimeline } from './animations/hero-timeline.js';
import { initFanCards } from './animations/fan-cards.js';
import { initScrollReveal } from './animations/scroll-reveal.js';
import { initTxCarousel } from './animations/tx-carousel.js';
import { initLogo3D } from './animations/logo-3d.js';
import { initNavbar } from './components/navbar.js';
import { initSolutionAnims } from './animations/solution-anims.js';
import { initAiChatAnim } from './animations/ai-chat-anim.js';
import { initProcessCinematic } from './animations/process-cinematic.js';

const STARTUP_DELAY_MS = 500;

function runInit(name, initFn) {
    try {
        initFn();
    } catch (error) {
        console.error(`[startup] Failed to initialize ${name}:`, error);
    }
}

function bootstrap() {
    runInit('hero timeline', initHeroTimeline);
    runInit('fan cards', initFanCards);
    runInit('navbar', initNavbar);
    runInit('3D logo', initLogo3D);

    // Keep the original stagger so hero animation starts first.
    window.setTimeout(() => {
        runInit('scroll reveal', initScrollReveal);
        runInit('transaction carousel', initTxCarousel);
        runInit('solution anims', initSolutionAnims);
        runInit('ai chat anim', initAiChatAnim);
        runInit('process cinematic', initProcessCinematic);
    }, STARTUP_DELAY_MS);
}

// Handle both normal page load and delayed script execution.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
    bootstrap();
}

