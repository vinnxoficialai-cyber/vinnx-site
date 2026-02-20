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
        pix: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
    </svg>`,
        dollar: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
        store: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`,
        nubank: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20V8"/>
    </svg>`,
        bag: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <path d="M3 10h18"/>
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
