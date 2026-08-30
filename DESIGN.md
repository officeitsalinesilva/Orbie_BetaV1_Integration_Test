# Orb Design System

## Brand
- Name: Orbie
---

# ORBIE — DESIGN SYSTEM

# CANONICAL UI PRESERVATION RULES

## 0. REGRA DE PRESERVAÇÃO VISUAL

Este documento descreve o Design System canônico do ORBIE.

O frontend existente é a referência visual primária.

O agente NÃO deve redesenhar uma interface existente apenas porque possui uma interpretação diferente do Design System.

Quando houver uma tela existente, a ordem de prioridade é:

1. Interface existente;
2. Componentes existentes;
3. Tokens existentes;
4. Este Design System;
5. Necessidade funcional da fase.

O Design System deve ser utilizado para manter consistência, não como autorização para reconstruir a aplicação.

---

# 0.1 NO INVENTED UI

É proibido adicionar elementos de interface sem necessidade funcional comprovável.

Isso inclui:

* cards;
* containers;
* títulos;
* subtítulos;
* seções;
* botões;
* CTAs;
* badges;
* chips;
* tabs;
* tooltips;
* indicadores;
* banners;
* chamadas promocionais;
* elementos decorativos.

Se o elemento não possui função real, não deve existir.

---

# 0.2 NO AUTOMATIC CARDIZATION

Não transformar automaticamente conteúdo em cards.

Cards não devem ser usados apenas para:

* preencher espaço;
* separar visualmente informações simples;
* tornar a tela "mais moderna";
* criar aparência de dashboard;
* imitar interfaces geradas por IA.

Utilizar cards somente quando o conteúdo representar uma unidade funcional ou semântica independente.

---

# 0.3 NO TITLE/NO SUBTITLE BY DEFAULT

Não adicionar títulos e subtítulos automaticamente.

Uma seção não precisa possuir um título apenas porque contém conteúdo.

Um card não precisa possuir subtítulo.

Uma métrica não precisa possuir título adicional.

Uma tela não precisa possuir uma introdução textual artificial.

A hierarquia deve ser criada somente quando melhora a compreensão ou representa uma estrutura real.

---

# 0.4 NO USELESS CTA

Todo botão deve possuir uma ação real.

Todo CTA deve produzir uma consequência funcional.

Não criar CTAs apenas para preencher a interface.

Não criar múltiplos caminhos para a mesma ação sem necessidade.

Não criar botões como:

* "Explorar";
* "Descobrir";
* "Saiba mais";
* "Começar";
* "Continuar";

quando não houver uma operação real correspondente.

---

# 0.5 CONTENT IS THE INTERFACE

O conteúdo existente não deve ser encapsulado em elementos visuais desnecessários.

Não utilizar:

CARD → TITLE → SUBTITLE → BUTTON

como estrutura padrão.

A estrutura deve surgir da função real do conteúdo.

---

# 0.6 ONE PRIMARY ACTION

Quando uma tela possui uma ação principal, ela deve permanecer claramente dominante.

Evitar múltiplos CTAs competindo pela atenção.

Não adicionar ações secundárias que não sejam necessárias para completar o fluxo.

---

# 0.7 EMPTY SPACE IS VALID

Espaço vazio não significa que a tela esteja incompleta.

Não adicionar elementos para "preencher" áreas vazias.

Espaçamento é parte da composição.

---

# 0.8 FUNCTION BEFORE DECORATION

Antes de adicionar qualquer elemento visual, determinar:

* qual informação representa;
* qual ação executa;
* qual estado representa;
* qual problema de UX resolve.

Se nenhuma dessas respostas existir:

NÃO ADICIONAR.

---

# 0.9 PRESERVE EXISTING UI

Integrações de backend devem preferencialmente alterar:

* dados;
* estados;
* loading;
* erro;
* persistência;
* autorização;
* comportamento;

sem alterar a estrutura visual existente.

A integração não deve ser utilizada como oportunidade para redesenhar a tela.

---

# 0.10 ADMIN/BACKSTAGE

O sistema atual possui uma superfície administrativa/backstage.

O Admin pode possuir interfaces mais técnicas e controles adicionais.

Não restringir o Admin para imitar prematuramente o futuro sistema público.

O sistema público será uma superfície posteriormente derivada e restrita.

Portanto, elementos técnicos podem existir no Admin quando necessários à operação.

---

# 0.11 WEB + MOBILE

Este Design System deve ser aplicado respeitando as implementações canônicas Web e Mobile.

Não presumir que um componente visual Web deve ser copiado literalmente para Mobile.

Preservar os padrões já existentes de cada plataforma.

---

# 0.12 REGRA FINAL

Não adicionar UI porque a ferramenta "espera" que uma tela tenha determinada estrutura.

Não adicionar UI porque uma tela parece vazia.

Não adicionar UI porque uma seção "fica melhor" dentro de um card.

Não adicionar UI porque um botão parece necessário visualmente.

Não adicionar UI porque uma IA considera isso uma boa prática genérica.

A pergunta correta é:

> "Qual é a função real deste elemento dentro do produto ORBIE?"

Se não houver função real, o elemento não deve ser criado.


## Design Philosophy

### Principles
- **Silêncio Visual**: Nenhum elemento grita. Hierarquia construída com espaçamento, peso tipográfico e tamanho — não com cor saturada.
- **Uma Coisa de Cada Vez**: Cada tela tem um propósito primário. Máximo um CTA primário por tela.
- **Profundidade Revelada**: Complexidade aparece em camadas. Começa simples, aprofunda conforme explora.
- **Feedback Sem Ruído**: Toda ação tem resposta discreta, suave, sem vibrar ou gritar.
- **Consistência Obsessiva**: Mesmo componente se comporta da mesma forma em todas as telas.
- **Mobile First, Desktop Elegante**: Cada decisão de layout considera primeiro o mobile.

### Reference Products
- Apple (system UI)
- Notion (typography hierarchy)
- Linear.app (minimalism, spacing)
- Things 3 (task clarity)
- Arc Browser (browser UI)
- Spotify (dark mode)

### Prohibited Visual Elements
- Gradients (except Apple-style subtle gradients)
- Emojis in UI text
- Decorative stars or cosmic ornamentation
- Boho or mystical styling
- Animated backgrounds
- Bright saturated colors as CTAs (use navy instead)

---

## Design Tokens

### Colors

| Token | Light Mode | Dark Mode | Use |
|-------|------------|-----------|-----|
| `--color-bg` | #FFFFFF | #000000 | Main background |
| `--color-surface` | #F5F5F5 | #111111 | Cards, inputs, panels |
| `--color-surface-2` | #EBEBEB | #1C1C1C | Hover states, alternate sections |
| `--color-border` | #E8E8E8 | #2A2A2A | Dividers, card borders |
| `--color-text-primary` | #111111 | #F0F0F0 | Primary text |
| `--color-text-secondary` | #555555 | #888888 | Secondary text, subtitles |
| `--color-text-tertiary` | #999999 | #555555 | Placeholders, captions, labels |
| `--color-accent` | #0A1628 | #0A1628 | CTAs, links, badges, brand identity |
| `--color-accent-soft` | #1A2B4A | #1A2B4A | Hover CTAs, selections, focus borders |
| `--color-success` | #1A5C38 | #2D9E60 | Confirmations, completed states |
| `--color-warning` | #7A4A00 | #CC8800 | Alerts, attention |
| `--color-error` | #6B1A1A | #CC3333 | Errors, destructive actions |

### Typography

| Token | Font | Use |
|-------|------|-----|
| `--font-sans` | DM Sans | All UI — body, labels, buttons, navigation |
| `--font-display` | Nunito Bold | "ORB" logo, large numbers (credits, indices) |
| `--font-editorial` | Cormorant Garamond | H1 main sections, citations, editorial product titles |
| `--font-mono` | JetBrains Mono | Numerical indices, frequencies, technical data |

**Fallback Fonts:**
- DM Sans → Inter or Plus Jakarta Sans
- Nunito → Poppins Bold
- Cormorant → Georgia (last resort)

**Font Size Scale:**

| Token | Value | Use |
|-------|-------|-----|
| `--text-xs` | 12px | Microlabels, badges, timestamps |
| `--text-sm` | 14px | Metadata, captions, support text |
| `--text-base` | 16px | Body text (minimum — avoids iOS zoom) |
| `--text-lg` | 18px | Featured body, card subtitles |
| `--text-xl` | 20px | Secondary section titles |
| `--text-2xl` | 24px | Module titles (H3) |
| `--text-3xl` | 30px | Page titles (H2), large numbers |
| `--text-4xl` | 36px | H1 mobile, display indices |
| `--text-5xl` | 48px | Hero sections, splash screen |

**Line Heights:**
- `--leading-tight`: 1.25 — Titles and large numbers
- `--leading-body`: 1.6 — Body text
- `--leading-relaxed`: 1.8 — Long syntheses, editorial artifacts

### Spacing & Borders

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Minimum — internal badge padding |
| `--space-2` | 8px | Icon+label gap, minimum element padding |
| `--space-3` | 12px | Chip padding, cluster gap |
| `--space-4` | 16px | Default card padding, list gap |
| `--space-6` | 24px | Medium card padding, section gap |
| `--space-8` | 32px | Module separation, mobile page padding |
| `--space-12` | 48px | Large section spacing |
| `--space-16` | 64px | Hero margin, desktop padding |
| `--radius-sm` | 6px | Badges, chips, pills |
| `--radius-md` | 10px | Small cards, inputs, buttons |
| `--radius-lg` | 16px | Content cards, modals |
| `--radius-xl` | 24px | Large cards, bottom sheets |
| `--radius-full` | 9999px | Avatars, circular buttons |

### Shadows (Light Mode Only)

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-none` | none | Default state |
| `--shadow-sm` | 0 1px 3px rgba(0,0,0,0.06) | Cards in light mode |
| `--shadow-md` | 0 4px 16px rgba(0,0,0,0.08) | Hover, modals |
| `--shadow-lg` | 0 8px 32px rgba(0,0,0,0.12) | Bottom sheets, popovers |

---

## Motion & Animations

| Token | Value | Use |
|-------|-------|-----|
| `--motion-micro` | 150ms ease-out | Hover, toggle, focus |
| `--motion-transition` | 250ms ease-out | State changes, badge updates |
| `--motion-modal` | 350ms spring(1,80,10,0) | Bottom sheets, modals |
| `--motion-page` | 300ms ease-out | Page transitions (fade or slide) |
| `--motion-oracle` | 400ms perspective(600px) rotateY(180deg) | Oracle card flip |

**Haptics (Mobile):**
- Oracle card reveal: `UIImpactFeedbackGenerator.medium`
- Purchase confirmation: `.light`
- Error: `.error`

**Principle:** Elements enter from where they make sense — modal from bottom, dropdown from top, sidebar from left. Nothing appears from nowhere.

---

## Components

### Button

| Variant | Styles |
|---------|--------|
| **Primary** | Background: `--color-accent`. Text: #FFFFFF. Radius: `--radius-md`. Padding: 12px 20px. Font: DM Sans 15px medium. Hover: `--color-accent-soft`. Active: scale(0.98). No shadow. |
| **Secondary (Outlined)** | Border: 1px solid `--color-border`. Background: transparent. Hover: background `--color-surface`. Same typography. |
| **Ghost** | No border, no background. Text: `--color-text-secondary`. Hover: background `--color-surface-2`. |
| **Icon button** | 40×40px. Background: transparent. Hover: `--color-surface-2`. Icon: 18px stroke 1.5px. |
| **Disabled** | Opacity: 0.4 on any variant. Cursor: not-allowed. |

### Card

| Variant | Styles |
|---------|--------|
| **Standard** | Background: `--color-bg` (light) / `--color-surface` (dark). Border: 1px solid `--color-border`. Radius: `--radius-lg`. Padding: `--space-6`. Shadow: `--shadow-sm` (light only). |
| **Featured** | Border: 1px solid rgba(10,22,40,0.3). Background: rgba(10,22,40,0.04). |
| **Oracle** | Background: #000000 (always). Content: white. Radius: `--radius-xl`. Proportion: square or slightly vertical. |
| **Empty / Loading** | Background: `--color-surface-2`. Skeleton shimmer: gradient animation 1.5s loop. |

### Input

| Variant | Styles |
|---------|--------|
| **Text** | Background: `--color-surface`. Border: 1px solid `--color-border`. Radius: `--radius-md`. Padding: 12px 14px. Font-size: 16px (avoids iOS zoom). Focus: border `--color-accent`. |
| **Checkbox** | Custom: 18×18px. Border 1.5px `--color-border`. Checked: background `--color-accent`, white checkmark SVG. |
| **Toggle** | 44×24px. Off: background `--color-border`. On: background `--color-accent`. Thumb white with `--shadow-sm`. Spring animation. |
| **Slider** | Track 4px. Off: `--color-border`. On: `--color-accent`. Thumb: 18px white `--shadow-sm`. |
| **Date fields** | 3 separate fields (DD / MM / YYYY) — never native date picker (inconsistent between devices). |

### Navigation

| Platform | Styles |
|----------|--------|
| **Sidebar (Web)** | 240px. Background: `--color-bg`. Border-right: 1px `--color-border`. Item active: background `--color-surface`, text medium, icon `--color-accent`. Collapse: 64px (icons only). |
| **Bottom Nav (Mobile)** | Height: 56px + safe area (iOS). Background: `--color-bg` + backdrop-filter:blur(20px). Border-top: 1px `--color-border`. 5 items. Active: icon + label in `--color-accent`. Central item: 48px (larger). |
| **Tab Bar (Screen)** | Underline active: 2px `--color-accent`. No background on tab. Transition: slide 150ms. |
| **Toast** | Bottom center. Max-width 360px. Background: #111111 (universal light/dark). Text: white. Radius: `--radius-md`. Auto-dismiss: 3s. Icon to the left. |

---

## Content Rules (Critical)

### Stage (Public) — NEVER SAY:
- Planets (Sun, Moon, Mars...)
- Signs (Aries, Taurus, Leo...)
- Houses (1st house, 12th house...)
- Astrology, horoscope, numerology, cabala
- Synthesis, mapping, algorithm, processing

### Stage (Public) — ALWAYS SAY:
- "Forces" (for planets)
- "Fields of Expression" (for signs)
- "Sectors of Life" (for houses)
- "Operators" (for numbers)
- "Indices" (for metrics)
- "Orb does individual analysis with proprietary methods"

### Admin (Backstage) — ANYTHING GOES:
- All technical data exposed
- Astrology, planets, signs, houses
- All logs and raw data

---

## Apple Design Reference

### What Orb Replicates:
- Space as a design element — empty space is intentional, not absence of content
- Typography as hierarchy — size and weight do the visual work; color is secondary
- No decorative element without function — if it has no function, it doesn't exist
- Dark mode of truth — not color inversion; complete redesign of visual hierarchy
- Micro-interactions that make the product feel alive without drawing attention
- Content is the design — the interface serves the content, never decorates it

### What Orb Does NOT Replicate:
- Boho or mystical styling
- Animated stars or cosmic ornamentation
- Purple gradients
- Fortune-telling aesthetic
- Mystical/energetic/ spiritual tone

---

## Component Priority for Stitch Implementation

| Order | Component |
|-------|-----------|
| 1 | Tokens (colors, typography, spacing) |
| 2 | Button (primary, secondary, ghost) |
| 3 | Card (standard, featured, oracle, empty) |
| 4 | Input (text, checkbox, toggle, slider, date fields) |
| 5 | Bottom Navigation (mobile, 5 items, central icon larger) |
| 6 | Sidebar (desktop, collapsible, icons) |
| 7 | Toast (dark universal) |
| 8 | Badge and Pill |
| 9 | Charts (Recharts with system tokens) |
| 10 | Frequency Player |
| 11 | Color Selector |
| 12 | Oracle Card (black background, flip animation) |