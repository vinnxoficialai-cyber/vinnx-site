# Plano Refinado: Abordagem Hibrida Inteligente

## Conceito: "Encontre seu plano ideal"

Em vez de separar cards e calculadora em blocos distintos, a ideia e **fundir os dois em uma experiencia unica e fluida**. O visitante responde 3 perguntas rapidas (quiz inline, sem wizard pesado) e os cards de plano se reorganizam, destacando o plano recomendado. Tudo acontece na mesma secao, sem mudar de pagina ou passo.

**Dado-chave:** Quizzes de recomendacao de plano convertem 20-50% dos visitantes em leads (vs 3-15% para formularios tradicionais). Empresas como Xero, Dropbox e Slack usam essa abordagem.

---

## Fluxo de Interacao

```
Estado Inicial (sem interacao):
Os 3 cards estao visiveis, sem destaque especial. Acima, o quiz inline.

Quiz (3 perguntas, resposta rapida por botao/toggle):
  Q1. "Quantos funcionarios sua empresa tem?"
      [1-5]  [6-20]  [21+]
  
  Q2. "Qual seu maior desafio hoje?"
      [Vender mais]  [Organizar processos]  [Escalar operacao]
  
  Q3. "Ja usa alguma ferramenta digital?"
      [Nao, comeco do zero]  [Sim, basico]  [Sim, avancado]

Apos responder:
  -> O card recomendado recebe DESTAQUE (borda verde solida, badge "Recomendado para voce")
  -> Os outros cards ficam levemente opacizados (mas ainda clicaveis)
  -> Abaixo dos cards, aparece um bloco inline:
     "Quer um diagnostico gratuito? Deixe seu WhatsApp"
     [Input WhatsApp] [Botao: Receber diagnostico]
```

---

## Wireframe Detalhado

```
+================================================================+
|                                                                  |
|  Kicker: "Planos"                                               |
|  H2: Encontre o plano ideal para o momento da sua empresa       |
|  P: Responda 3 perguntas e descubra a melhor opcao.             |
|                                                                  |
|  +------------------------------------------------------------+ |
|  |  QUIZ INLINE (horizontal, fundo sutil rgba)                 | |
|  |                                                              | |
|  |  01  Quantos funcionarios?                                   | |
|  |  [1-5]  [6-20]  [21+]            <-- toggles pill            | |
|  |                                                              | |
|  |  02  Maior desafio?                                          | |
|  |  [Vender mais]  [Organizar]  [Escalar]                       | |
|  |                                                              | |
|  |  03  Ferramentas digitais?                                   | |
|  |  [Nenhuma]  [Basico]  [Avancado]                             | |
|  +------------------------------------------------------------+ |
|                                                                  |
|  +------------+  +==================+  +------------+            |
|  |   Start    |  ||    Growth      ||  |   Scale    |            |
|  |            |  || RECOMENDADO    ||  |            |            |
|  | Para quem  |  || Para empresas  ||  | Para alta  |            |
|  | esta       |  || em crescimento ||  | escala     |            |
|  | comecando  |  ||                ||  |            |            |
|  |            |  || Badge verde    ||  |            |            |
|  | - feat 1   |  || - feat 1       ||  | - feat 1   |            |
|  | - feat 2   |  || - feat 2       ||  | - feat 2   |            |
|  | - feat 3   |  || - feat 3       ||  | - feat 3   |            |
|  |            |  ||                ||  |            |            |
|  | [CTA]      |  || [CTA destaque] ||  | [CTA]      |            |
|  | opacity:0.7|  || opacity:1      ||  | opacity:0.7|            |
|  +------------+  +==================+  +------------+            |
|                                                                  |
|  +------------------------------------------------------------+ |
|  |  DIAGNOSTICO INLINE (aparece apos quiz)                     | |
|  |                                                              | |
|  |  "Quer um diagnostico gratuito personalizado?"              | |
|  |                                                              | |
|  |  [WhatsApp: (11) 99999-9999]   [Receber diagnostico ->]    | |
|  +------------------------------------------------------------+ |
|                                                                  |
+================================================================+
```

---

## Detalhes dos Cards (sem precos)

| Card | Subtitulo | Features |
|------|-----------|----------|
| **Start** | Para quem esta comecando a digitalizar | 1 agente IA 24/7, Servicos Google, 1 visita mensal, 2 alteracoes/mes |
| **Growth** | Para empresas em crescimento acelerado | Agente IA 24/7, Sistema ERP/PDV, 1 visita semanal, 4 alteracoes/mes |
| **Scale** | Para operacoes de alta escala e complexidade | Squad dedicado, Roadmap trimestral, Suporte prioritario, Trafego + Social opcionais |

**CTA dos cards:** Cada botao leva ao WhatsApp com mensagem pre-preenchida:
- Start: "Ola, tenho interesse no plano Start da VINNX"
- Growth: "Ola, tenho interesse no plano Growth da VINNX"
- Scale: "Ola, quero montar uma proposta Scale com a VINNX"

---

## Logica do Quiz (JavaScript)

```
Regra de recomendacao (simplificada):

SE funcionarios <= 5 E desafio == "Vender mais" E ferramentas == "Nenhuma"
  -> Recomendar START

SE funcionarios 6-20 OU desafio == "Organizar processos"
  -> Recomendar GROWTH

SE funcionarios 21+ OU desafio == "Escalar" OU ferramentas == "Avancado"
  -> Recomendar SCALE
```

A recomendacao so aparece quando **todas as 3 perguntas foram respondidas**. Antes disso, os 3 cards ficam iguais sem destaque.

---

## Secao de Add-ons

Mantem separada, abaixo dos planos. Mas simplificada: sem botoes proprios, apenas cards informativos com texto "Disponivel como complemento a qualquer plano".

---

## Mobile

- Quiz: perguntas empilhadas verticalmente, toggles em largura total
- Cards: carrossel horizontal (swipe) ou empilhados
- Bloco diagnostico: input e botao em coluna

---

## Restricoes de Design

- **Sem neon**: cores solidas e sutis (verde `#22c55e` apenas em bordas e badges)
- **Sem degrades vistosos**: fundos flat escuros (`#0d1117`, `#161b22`) 
- **Bordas finas** (`1px solid rgba(...)`) para separacao visual
- **Tipografia limpa**: hierarquia clara com peso e tamanho

---

## Arquivos Envolvidos

| Acao | Arquivo |
|------|---------|
| MODIFY | [index.html](file:///c:/Users/User/Desktop/vinnx%20site/index.html) -- substituir secoes pricing + addons |
| NEW | `src/styles/calculator.css` -- estilos do quiz + diagnostico |
| NEW | `src/animations/plan-quiz.js` -- logica do quiz e recomendacao |
| MODIFY | [src/main.js](file:///c:/Users/User/Desktop/vinnx%20site/src/main.js) -- importar e inicializar `initPlanQuiz` |
| MODIFY | [src/styles/sections.css](file:///c:/Users/User/Desktop/vinnx%20site/src/styles/sections.css) -- ajustar cards pricing (remover precos, adicionar estados) |
