/**
 * AI Chat Animation — Staggered chat bubble reveals + phone showcase observer
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
                        animateChat('chatNormal');
                        animateChat('chatVinnx');
                    }, 600);
                }
            });
        },
        { threshold: 0.2 }
    );

    observer.observe(showcase);
}

function animateChat(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const bubbles = container.querySelectorAll('.chat-bubble-v2, .chat-time-gap');
    const typing = container.closest('.phone-screen-v2')?.querySelector('.chat-typing-v2');

    bubbles.forEach((bubble) => {
        const delay = parseInt(bubble.dataset.delay, 10) || 0;
        setTimeout(() => {
            bubble.classList.add('shown');
        }, delay);
    });

    // Show typing indicator on VINNX phone
    if (typing) {
        const typingDelay = parseInt(typing.dataset.delay, 10) || 3200;
        setTimeout(() => {
            typing.classList.add('shown');
        }, typingDelay);
    }
}
