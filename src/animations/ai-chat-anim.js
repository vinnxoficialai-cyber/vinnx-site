/**
 * AI Chat Animation — Cinematic staggered chat with typing simulation
 */
export function initAiChatAnim() {
    const showcase = document.getElementById('phonesShowcase');
    if (!showcase) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    showcase.classList.add('in-view');
                    observer.unobserve(showcase);

                    // Start chat animations after phones appear
                    setTimeout(() => {
                        animateChatNormal('chatNormal');
                        animateChatVinnx('chatVinnx');
                    }, 600);
                }
            });
        },
        { threshold: 0.2 }
    );

    observer.observe(showcase);
}

/**
 * Simulate typing text into the input bar letter by letter
 */
function simulateTyping(inputBar, text, duration, callback) {
    if (!inputBar) {
        if (callback) callback();
        return;
    }
    const input = inputBar.querySelector('input');
    if (!input) {
        if (callback) callback();
        return;
    }

    inputBar.classList.add('typing');
    const charDelay = duration / text.length;
    let i = 0;

    const interval = setInterval(() => {
        i++;
        input.value = text.substring(0, i);
        if (i >= text.length) {
            clearInterval(interval);
            // Brief pause then "send"
            setTimeout(() => {
                input.value = '';
                inputBar.classList.remove('typing');
                if (callback) callback();
            }, 250);
        }
    }, charDelay);
}

/**
 * Normal chat — slower, frustrating experience
 */
function animateChatNormal(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const screen = container.closest('.phone-screen-v2');
    const inputBar = screen?.querySelector('.chat-input-bar');
    const bubbles = container.querySelectorAll('.chat-bubble-v2, .chat-time-gap');

    // Phase 1: Type the user message in the input bar
    const userMsg = 'Oi, preciso mudar a data de entrega do pedido #3981.';
    simulateTyping(inputBar, userMsg, 1200, () => {
        // Phase 2: Show user bubble
        const userBubble = bubbles[0];
        if (userBubble) userBubble.classList.add('shown');

        // Phase 3: After a long pause, show agent response
        setTimeout(() => {
            if (bubbles[1]) bubbles[1].classList.add('shown');
        }, 1800);

        // Phase 4: Time gap
        setTimeout(() => {
            if (bubbles[2]) bubbles[2].classList.add('shown');
        }, 3500);

        // Phase 5: User frustrated message
        setTimeout(() => {
            if (bubbles[3]) bubbles[3].classList.add('shown');
        }, 5000);

        // Phase 6: Agent deflects
        setTimeout(() => {
            if (bubbles[4]) bubbles[4].classList.add('shown');
        }, 6500);
    });
}

/**
 * VINNX chat — fast, multi-agent, cinematic
 */
function animateChatVinnx(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const screen = container.closest('.phone-screen-v2');
    const inputBar = screen?.querySelector('.chat-input-bar');
    const typing = screen?.querySelector('.chat-typing-v2');
    const bubbles = container.querySelectorAll('.chat-bubble-v2');

    // Phase 1: Type the user message in the input bar
    const userMsg = 'Oi, preciso mudar a data de entrega do pedido #3981.';
    simulateTyping(inputBar, userMsg, 1200, () => {
        // Phase 2: Show user bubble
        if (bubbles[0]) bubbles[0].classList.add('shown');

        // Phase 3: Show typing indicator briefly, then first agent
        setTimeout(() => {
            if (typing) typing.classList.add('shown');
        }, 300);

        setTimeout(() => {
            if (typing) typing.classList.remove('shown');
            if (bubbles[1]) bubbles[1].classList.add('shown');
        }, 900);

        // Phase 4: Typing then second agent
        setTimeout(() => {
            if (typing) typing.classList.add('shown');
        }, 1400);

        setTimeout(() => {
            if (typing) typing.classList.remove('shown');
            if (bubbles[2]) bubbles[2].classList.add('shown');
        }, 2000);

        // Phase 5: Typing then third agent
        setTimeout(() => {
            if (typing) typing.classList.add('shown');
        }, 2500);

        setTimeout(() => {
            if (typing) typing.classList.remove('shown');
            if (bubbles[3]) bubbles[3].classList.add('shown');
        }, 3100);

        // Phase 6: Final confirmation with a short pause
        setTimeout(() => {
            if (typing) typing.classList.add('shown');
        }, 3600);

        setTimeout(() => {
            if (typing) typing.classList.remove('shown');
            if (bubbles[4]) bubbles[4].classList.add('shown');
        }, 4200);
    });
}
