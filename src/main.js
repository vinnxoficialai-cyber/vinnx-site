/**
 * Main entry point - imports styles and initializes all modules
 */

import { initHeroTimeline } from './animations/hero-timeline.js';
import { initFanCards } from './animations/fan-cards.js';
import { initScrollReveal } from './animations/scroll-reveal.js';
import { initTxCarousel } from './animations/tx-carousel.js';
import { initLogo3D } from './animations/logo-3d.js';
import { initNavbar } from './components/navbar.js';
import { initFooterSpline } from './components/spline-footer.js';
import { initSolutionAnims } from './animations/solution-anims.js';
import { initAiChatAnim } from './animations/ai-chat-anim.js';
import { initProcessCinematic } from './animations/process-cinematic.js';
import { initCtaRotator } from './animations/cta-rotator.js';
import { initFaqAccordion } from './animations/faq-accordion.js';
import { initButtonOpenFeedback } from './animations/button-open-feedback.js';
import { initPlanQuiz } from './animations/plan-quiz.js';

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
    runInit('footer spline', initFooterSpline);
    runInit('cta rotator', initCtaRotator);
    runInit('faq accordion', initFaqAccordion);
    runInit('button open feedback', initButtonOpenFeedback);
    runInit('plan quiz', initPlanQuiz);

    // Keep the original stagger so hero animation starts first.
    window.setTimeout(() => {
        runInit('scroll reveal', initScrollReveal);
        runInit('transaction carousel', initTxCarousel);
        runInit('solution anims', initSolutionAnims);
        runInit('ai chat anim', initAiChatAnim);
        runInit('process cinematic', initProcessCinematic);
    }, STARTUP_DELAY_MS);

    // Live clock in phone mockups
    function updatePhoneClocks() {
        const now = new Date();
        const h = now.getHours();
        const m = String(now.getMinutes()).padStart(2, '0');
        const timeStr = `${h}:${m}`;
        document.querySelectorAll('.status-time').forEach(el => { el.textContent = timeStr; });
    }
    updatePhoneClocks();
    setInterval(updatePhoneClocks, 30_000);
}

// Handle both normal page load and delayed script execution.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
    bootstrap();
}

