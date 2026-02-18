/**
 * Transaction Carousel — Rotating card stack animation
 */
export function initTxCarousel() {
    const transactions = [
        { name: 'Marcos Vinicius', amount: '+R$95,00', label: 'PIX RECEBIDO', style: 'tx-cyan', icon: 'pix' },
        { name: 'Paulo Lyra', amount: '+R$50,00', label: 'VENDA FEITA', style: 'tx-green', icon: 'dollar' },
        { name: 'Gleyse Kelly', amount: '+R$78,00', label: 'NOVO PEDIDO', style: 'tx-orange', icon: 'store' },
        { name: 'Elon Musk', amount: '+R$50,00', label: 'PIX RECEBIDO', style: 'tx-purple', icon: 'nubank' },
        { name: 'Mysael Santos', amount: '+R$120,00', label: 'NOVA VENDA', style: 'tx-pink', icon: 'bag' },
    ];

    const svgIcons = {
        pix: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
      <path d="M342.7 336c-13.9 0-27.1-5.4-36.9-15.3l-67.4-67.4c-5-5-13-5-18 0l-67.7 67.7c-9.9 9.9-23 15.3-36.9 15.3h-13l85.4 85.4c20.3 20.3 53.2 20.3 73.5 0l85.7-85.7h-4.7zM116 176c13.9 0 27.1 5.4 36.9 15.3l67.7 67.7c5 5 13 5 18 0l67.4-67.4c9.9-9.9 23-15.3 36.9-15.3h4.7l-85.7-85.7c-20.3-20.3-53.2-20.3-73.5 0L103 176h13zM424.8 204.4l-55.4-55.4c1.5 3.5 2.3 7.4 2.3 11.5v18.5c0 9.9-3.9 19.4-10.8 26.4l-67.4 67.4c-9.3 9.3-21.6 14.4-34.7 14.4s-25.4-5.1-34.7-14.4l-67.7-67.7c-6.9-6.9-16.4-10.8-26.4-10.8H112c-4.1 0-8-.8-11.5-2.3l-55.4 55.4c-20.3 20.3-20.3 53.2 0 73.5l55.4 55.4c-1.5-3.5-2.3-7.4-2.3-11.5v-18.5c0-9.9 3.9-19.4 10.8-26.4l67.7-67.7c9.3-9.3 21.6-14.4 34.7-14.4 13.1 0 25.4 5.1 34.7 14.4l67.4 67.4c6.9 6.9 16.4 10.8 26.4 10.8h18.5c4.1 0 8 .8 11.5 2.3l55.4-55.4c20.3-20.3 20.3-53.2-.1-73.5z"/>
    </svg>`,
        dollar: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>`,
        store: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 7l4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
      <path d="M4 22V12m16 10V12M2 7h20M7 22v-5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5"/>
    </svg>`,
        nubank: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 19V5l12 14V5"/>
    </svg>`,
        bag: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>`,
    };

    const stack = document.getElementById('txStack');
    if (!stack) return;

    const POSITIONS = ['exit', 'top', 'center', 'bottom', 'buffer'];
    const ALL_STYLES = ['tx-cyan', 'tx-green', 'tx-orange', 'tx-purple', 'tx-pink', 'tx-yellow', 'tx-red'];

    function renderContent(el, t) {
        el.classList.remove(...ALL_STYLES);
        el.classList.add(t.style);
        el.innerHTML = `
      <div class="tx-card-left">
        <div class="tx-icon">${svgIcons[t.icon]}</div>
        <div class="tx-meta">
          <span class="tx-label">${t.label}</span>
          <span class="tx-name">${t.name}</span>
        </div>
      </div>
      <div class="tx-amount">${t.amount}</div>`;
    }

    let txDataIndex = 0;
    const cardEls = POSITIONS.map((pos) => {
        const el = document.createElement('div');
        el.className = 'tx-card';
        el.setAttribute('data-pos', pos);
        renderContent(el, transactions[txDataIndex % transactions.length]);
        txDataIndex++;
        stack.appendChild(el);
        return el;
    });

    function cycleCards() {
        cardEls.forEach((el) => {
            const cur = el.getAttribute('data-pos');
            const curIdx = POSITIONS.indexOf(cur);
            const nextIdx = (curIdx - 1 + POSITIONS.length) % POSITIONS.length;
            const nextPos = POSITIONS[nextIdx];

            if (nextPos === 'buffer') {
                el.classList.add('no-transition');
                renderContent(el, transactions[txDataIndex % transactions.length]);
                txDataIndex++;
                el.setAttribute('data-pos', 'buffer');
                el.getBoundingClientRect(); // Force reflow
                el.classList.remove('no-transition');
            } else {
                el.setAttribute('data-pos', nextPos);
            }
        });
    }

    let txInterval = null;
    function startCycle() {
        if (!txInterval) {
            txInterval = window.setInterval(cycleCards, 1900);
        }
    }

    function stopCycle() {
        if (txInterval) {
            clearInterval(txInterval);
            txInterval = null;
        }
    }

    // Fallback for browsers that do not support IntersectionObserver.
    if (!('IntersectionObserver' in window)) {
        startCycle();
        return;
    }

    const txObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    startCycle();
                } else {
                    stopCycle();
                }
            });
        },
        { threshold: 0.2 }
    );

    txObserver.observe(stack);
}
