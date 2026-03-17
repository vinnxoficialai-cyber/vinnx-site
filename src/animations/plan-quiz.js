/**
 * Plan assessment accordion with live plan preview and staged result reveal.
 */

const WHATSAPP_BASE_URL = 'https://wa.me/553799417496';
const AUTO_ADVANCE_DELAY_MS = 180;

const PLAN_META = {
    start: {
        title: 'Start',
        reason: 'Melhor encaixe para estruturar a base digital, acelerar o atendimento e começar com uma operação mais organizada.',
    },
    growth: {
        title: 'Growth',
        reason: 'Melhor encaixe para integrar processos, ganhar previsibilidade e crescer com mais controle operacional.',
    },
    scale: {
        title: 'Scale',
        reason: 'Melhor encaixe para operações que já exigem arquitetura dedicada, prioridade e acompanhamento mais próximo.',
    },
};

export function initPlanQuiz() {
    const quizEl = document.getElementById('planQuiz');
    const resultsShellEl = document.getElementById('pricingResultsShell');
    const resultsGridEl = document.getElementById('pricingResults');
    const resultTitleEl = document.getElementById('planResultTitle');
    const resultTextEl = document.getElementById('planResultText');
    const diagnosticEl = document.getElementById('planDiagnostic');
    const inputEl = document.getElementById('diagWhatsApp');
    const sendButtonEl = document.getElementById('diagSendBtn');

    if (!quizEl || !resultsShellEl || !resultsGridEl || !diagnosticEl) {
        return;
    }

    const cards = Array.from(document.querySelectorAll('.pricing-card[data-plan]'));
    const steps = Array.from(quizEl.querySelectorAll('.plan-step[data-step]'));
    const matchChips = Array.from(quizEl.querySelectorAll('.plan-match-chip[data-plan-preview]'));
    const answerEls = {
        team: quizEl.querySelector('[data-answer-for="team"]'),
        challenge: quizEl.querySelector('[data-answer-for="challenge"]'),
        tools: quizEl.querySelector('[data-answer-for="tools"]'),
    };
    const answers = { team: '', challenge: '', tools: '' };
    const answerLabels = { team: '', challenge: '', tools: '' };
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = window.matchMedia('(max-width: 767px)');

    steps.forEach((stepEl) => {
        const triggerEl = stepEl.querySelector('.plan-step-trigger');
        const panelEl = stepEl.querySelector('.plan-step-panel');
        const radioEls = Array.from(stepEl.querySelectorAll('.plan-step-radio'));

        if (triggerEl) {
            triggerEl.addEventListener('click', () => {
                if (stepEl.classList.contains('is-open')) {
                    return;
                }

                openStep(stepEl, { reduceMotion: motionQuery.matches, scrollIntoView: true });
            });
        }

        radioEls.forEach((radioEl) => {
            radioEl.addEventListener('change', () => {
                if (!radioEl.checked) {
                    return;
                }

                const wasComplete = allQuestionsAnswered(answers);
                const questionKey = radioEl.name;
                const optionLabelEl = radioEl.closest('.plan-step-option');

                answers[questionKey] = radioEl.value;
                answerLabels[questionKey] = optionLabelEl?.dataset.optionLabel || optionLabelEl?.textContent?.trim() || '';

                updateAnswerSummaries(answerLabels, answerEls, steps);
                updateMatchRail(matchChips, getPreviewPlan(answers), allQuestionsAnswered(answers));
                syncQuizState(quizEl, answers);

                const delay = motionQuery.matches ? 0 : AUTO_ADVANCE_DELAY_MS;
                stepEl.classList.add('is-selecting');

                window.setTimeout(() => {
                    stepEl.classList.remove('is-selecting');

                    if (allQuestionsAnswered(answers)) {
                        collapseStep(stepEl, motionQuery.matches);
                        applyRecommendation(determinePlan(answers), {
                            cards,
                            quizEl,
                            resultsShellEl,
                            resultsGridEl,
                            resultTitleEl,
                            resultTextEl,
                            diagnosticEl,
                        });

                        if (!wasComplete) {
                            const recommendedCard = cards.find((c) => c.classList.contains('recommended'));
                            const scrollTarget = recommendedCard || resultsShellEl;

                            window.setTimeout(() => {
                                scrollTarget.scrollIntoView({
                                    behavior: motionQuery.matches ? 'auto' : 'smooth',
                                    block: 'center',
                                });
                            }, 350);
                        }

                        return;
                    }

                    if (!wasComplete) {
                        const currentIndex = Number(stepEl.dataset.step || 0);
                        const nextStepEl = steps[currentIndex + 1];
                        if (nextStepEl) {
                            openStep(nextStepEl, { reduceMotion: motionQuery.matches, scrollIntoView: true });
                        }
                    }
                }, delay);
            });
        });
    });

    if (inputEl) {
        inputEl.addEventListener('input', () => {
            inputEl.value = formatPhoneNumber(inputEl.value);
            inputEl.setCustomValidity('');
        });

        inputEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendDiagnostic(cards, inputEl);
            }
        });
    }

    sendButtonEl?.addEventListener('click', () => {
        sendDiagnostic(cards, inputEl);
    });

    syncInitialState({
        steps,
        answerEls,
        matchChips,
        quizEl,
        reduceMotion: motionQuery.matches,
    });
}

function syncInitialState({ steps, answerEls, matchChips, quizEl, reduceMotion }) {
    steps.forEach((stepEl, index) => {
        const panelEl = stepEl.querySelector('.plan-step-panel');
        const shouldOpen = index === 0;

        stepEl.classList.toggle('is-open', shouldOpen);
        stepEl.classList.remove('is-answered', 'is-selecting');

        const triggerEl = stepEl.querySelector('.plan-step-trigger');
        if (triggerEl) {
            triggerEl.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        }

        if (!panelEl) {
            return;
        }

        if (shouldOpen) {
            panelEl.hidden = false;
            panelEl.dataset.faqState = 'open';
            panelEl.style.opacity = '1';
            panelEl.style.height = reduceMotion ? 'auto' : `${panelEl.scrollHeight}px`;

            if (!reduceMotion) {
                requestAnimationFrame(() => {
                    panelEl.style.height = 'auto';
                });
            }
        } else {
            panelEl.hidden = true;
            panelEl.dataset.faqState = 'closed';
            panelEl.style.height = '0px';
            panelEl.style.opacity = '0';
        }
    });

    Object.values(answerEls).forEach((answerEl) => {
        if (answerEl) {
            answerEl.textContent = 'Selecionar';
        }
    });

    updateMatchRail(matchChips, '', false);
    syncQuizState(quizEl, { team: '', challenge: '', tools: '' });
}

function openStep(targetStepEl, { reduceMotion, scrollIntoView }) {
    const steps = Array.from(targetStepEl.closest('.plan-quiz-accordion')?.querySelectorAll('.plan-step[data-step]') || []);

    steps.forEach((stepEl) => {
        if (stepEl === targetStepEl) {
            expandStep(stepEl, reduceMotion);
        } else {
            collapseStep(stepEl, reduceMotion);
        }
    });

    if (scrollIntoView) {
        window.requestAnimationFrame(() => {
            targetStepEl.scrollIntoView({
                behavior: reduceMotion ? 'auto' : 'smooth',
                block: 'nearest',
            });
        });
    }
}

function expandStep(stepEl, reduceMotion) {
    const triggerEl = stepEl.querySelector('.plan-step-trigger');
    const panelEl = stepEl.querySelector('.plan-step-panel');
    const contentEl = stepEl.querySelector('.plan-step-panel-inner');

    if (!triggerEl || !panelEl || !contentEl) {
        return;
    }

    triggerEl.setAttribute('aria-expanded', 'true');
    stepEl.classList.add('is-open');
    panelEl.hidden = false;

    if (reduceMotion) {
        panelEl.dataset.faqState = 'open';
        panelEl.style.height = 'auto';
        panelEl.style.opacity = '1';
        return;
    }

    panelEl.dataset.faqState = 'opening';
    panelEl.style.height = '0px';
    panelEl.style.opacity = '0';
    panelEl.offsetHeight;
    panelEl.style.height = `${contentEl.scrollHeight}px`;
    panelEl.style.opacity = '1';

    const onEnd = (event) => {
        if (event.propertyName !== 'height') {
            return;
        }

        panelEl.removeEventListener('transitionend', onEnd);

        if (panelEl.dataset.faqState !== 'opening') {
            return;
        }

        panelEl.dataset.faqState = 'open';
        panelEl.style.height = 'auto';
    };

    panelEl.addEventListener('transitionend', onEnd);
}

function collapseStep(stepEl, reduceMotion) {
    const triggerEl = stepEl.querySelector('.plan-step-trigger');
    const panelEl = stepEl.querySelector('.plan-step-panel');

    if (!triggerEl || !panelEl) {
        return;
    }

    triggerEl.setAttribute('aria-expanded', 'false');
    stepEl.classList.remove('is-open');

    if (reduceMotion) {
        panelEl.dataset.faqState = 'closed';
        panelEl.hidden = true;
        panelEl.style.height = '0px';
        panelEl.style.opacity = '0';
        return;
    }

    const startHeight = panelEl.scrollHeight;
    if (!startHeight) {
        panelEl.dataset.faqState = 'closed';
        panelEl.hidden = true;
        panelEl.style.height = '0px';
        panelEl.style.opacity = '0';
        return;
    }

    panelEl.dataset.faqState = 'closing';
    panelEl.style.height = `${startHeight}px`;
    panelEl.style.opacity = '1';
    panelEl.offsetHeight;
    panelEl.style.height = '0px';
    panelEl.style.opacity = '0';

    const onEnd = (event) => {
        if (event.propertyName !== 'height') {
            return;
        }

        panelEl.removeEventListener('transitionend', onEnd);

        if (panelEl.dataset.faqState !== 'closing') {
            return;
        }

        panelEl.dataset.faqState = 'closed';
        panelEl.hidden = true;
    };

    panelEl.addEventListener('transitionend', onEnd);
}

function syncQuizState(quizEl, answers) {
    const hasAnswers = Object.values(answers).some(Boolean);
    quizEl.classList.toggle('is-in-progress', hasAnswers);
    quizEl.classList.toggle('is-complete', allQuestionsAnswered(answers));
}

function updateAnswerSummaries(answerLabels, answerEls, steps) {
    Object.entries(answerEls).forEach(([key, answerEl]) => {
        if (!answerEl) {
            return;
        }

        const label = answerLabels[key] || 'Selecionar';
        answerEl.textContent = label;
        answerEl.classList.toggle('is-placeholder', !answerLabels[key]);
    });

    steps.forEach((stepEl) => {
        const key = stepEl.dataset.questionKey;
        stepEl.classList.toggle('is-answered', Boolean(key && answerLabels[key]));
    });
}

function updateMatchRail(matchChips, activePlan, isComplete) {
    matchChips.forEach((chipEl) => {
        const isActive = chipEl.dataset.planPreview === activePlan;
        chipEl.classList.toggle('is-active', isActive);
        chipEl.classList.toggle('is-locked', isActive && isComplete);
    });
}

function determinePlan({ team, challenge, tools }) {
    if (team === 'large' || challenge === 'scale' || tools === 'advanced') {
        return 'scale';
    }

    if (team === 'medium' || challenge === 'organize') {
        return 'growth';
    }

    if (team === 'small' && challenge === 'sell' && tools === 'none') {
        return 'start';
    }

    return 'growth';
}

function getPreviewPlan({ team, challenge, tools }) {
    if (!team && !challenge && !tools) {
        return '';
    }

    if (team === 'large' || challenge === 'scale' || tools === 'advanced') {
        return 'scale';
    }

    if (team === 'medium' || challenge === 'organize') {
        return 'growth';
    }

    return 'start';
}

function allQuestionsAnswered(answers) {
    return Object.values(answers).every(Boolean);
}

function applyRecommendation(plan, refs) {
    const {
        cards,
        quizEl,
        resultsShellEl,
        resultsGridEl,
        resultTitleEl,
        resultTextEl,
        diagnosticEl,
    } = refs;
    const planMeta = PLAN_META[plan] || PLAN_META.growth;
    const recommendedIndex = cards.findIndex((cardEl) => cardEl.dataset.plan === plan);
    const revealOrder = cards
        .map((_, index) => index)
        .filter((index) => index !== recommendedIndex)
        .concat(recommendedIndex >= 0 ? [recommendedIndex] : []);

    if (resultTitleEl) {
        resultTitleEl.textContent = planMeta.title;
    }

    if (resultTextEl) {
        resultTextEl.textContent = planMeta.reason;
    }

    quizEl.classList.add('is-complete');

    cards.forEach((cardEl) => {
        const isRecommended = cardEl.dataset.plan === plan;
        cardEl.classList.toggle('recommended', isRecommended);
        cardEl.classList.toggle('dimmed', !isRecommended);
        cardEl.classList.toggle('is-mobile-priority', isRecommended);
        cardEl.classList.remove('plan-card-reveal');
        cardEl.style.removeProperty('--plan-card-delay');
    });

    if (resultsShellEl.hidden) {
        resultsShellEl.hidden = false;
    }

    if (diagnosticEl.hidden) {
        diagnosticEl.hidden = false;
    }

    window.requestAnimationFrame(() => {
        resultsShellEl.classList.add('is-visible');
        diagnosticEl.classList.add('visible');

        revealOrder.forEach((cardIndex, order) => {
            const cardEl = cards[cardIndex];
            if (!cardEl) {
                return;
            }

            cardEl.classList.add('stagger-in', 'plan-card-reveal');
            cardEl.style.setProperty('--plan-card-delay', `${70 + (order * 80)}ms`);
        });

        resultsGridEl.classList.add('is-visible');
    });
}

function sendDiagnostic(cards, inputEl) {
    const recommendedCardEl = cards.find((cardEl) => cardEl.classList.contains('recommended'));

    if (!recommendedCardEl || !inputEl) {
        return;
    }

    const digits = inputEl.value.replace(/\D/g, '');

    if (digits.length < 10) {
        inputEl.setCustomValidity('Informe um WhatsApp válido para receber o diagnóstico.');
        inputEl.reportValidity();
        inputEl.focus();
        return;
    }

    inputEl.setCustomValidity('');

    const planName = recommendedCardEl.querySelector('h3')?.textContent?.trim() || 'personalizado';
    const phoneText = formatPhoneNumber(digits);
    const message = encodeURIComponent(
        `Olá! Fiz o diagnóstico no site da VINNX e meu plano recomendado foi o ${planName}. Quero receber meu diagnóstico gratuito. Meu WhatsApp: ${phoneText}`
    );

    window.open(`${WHATSAPP_BASE_URL}?text=${message}`, '_blank', 'noopener');
}

function formatPhoneNumber(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) {
        return digits ? `(${digits}` : '';
    }

    if (digits.length <= 7) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
