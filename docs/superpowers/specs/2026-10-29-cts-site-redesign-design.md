# CTS Consultoria — Redesenho institucional + Chatbot + Dashboards

> **Data:** 2026-10-29 · **Estado:** aprovado pelo utilizador em 2026-10-29 · **Âmbito:** Fase 4 (sistema visual) + Fase 5 (site público) + Fase 9 (chatbot, parcial) + áreas admin/estudante

---

## 1. Contexto e problema

A Fase 5 entregou um site funcional mas **sem linguagem visual institucional**. Diagnóstico verificado no código:

| Problema | Evidência |
|---|---|
| Tipografia de SO, sem next/font | `src/app/[locale]/globals.css:16-17` |
| Tokens incompletos + valores fora do sistema | `globals.css:4-18`; `#004a9c` em `(public)/page.tsx:26`; `#0E7A4F` em `views/contact-view.tsx:59` e `contact-form.tsx:16` |
| Zero fotografia; `<img>` cru de 2,1 MB | `(public)/page.tsx:93`, `views/about-view.tsx:37` |
| Header sem CTA; usa ícone PWA como logo; hamburger duplo; switcher de idioma 404 | `site-header.tsx:21-22, 30-42, 76-91` |
| 404 rebenta (devolve `Metadata` em vez de JSX) | `(public)/not-found.tsx:4-8` |
| Sitemap com 6 URLs PT erradas | `src/app/sitemap.ts:33` |
| 5 botões de WhatsApp; 0 ícones sociais | `(public)/page.tsx:215-220`, `views/training-view.tsx:45-50`, `views/service-detail-view.tsx:57-63` |
| Erros do formulário calculados e descartados; "Submissão successful"; "Disclaimer" vazio | `contact-form.tsx:17, 65-69, 78-80` |
| `motion` usado em 1 ficheiro, 0,7 s, sem 3D/parallax/AnimatePresence | `src/components/reveal.tsx:30` |
| Chatbot nunca construído | `docs/05 §e`, `docs/21` Fase 9 |
| Dashboards são placeholders; não existe área de formando | `admin/(protected)/dashboard/page.tsx` |

## 2. Objectivos e fora de âmbito

**Objectivos**
1. Identidade visual institucional: tokens completos, tipografia de marca, fotografia real, ritmo editorial.
2. Header em 3 camadas (ticker de texto + barra principal + drawer mobile) com mega-menu e comutador de idioma funcional.
3. Hero slider com imagens fornecidas pelo utilizador e parallax 3D ao scroll.
4. Animações de scroll com efeito 3D em todo o site (`motion/react`).
5. Rodapé de 4 colunas como **único** ponto de redes sociais; WhatsApp concentrado num único ponto.
6. Chatbot OpenAI que responde a perguntas sobre empresa e formação, com corpus autorizado e anti-injection.
7. Dashboard admin em cards (interface completa) e área de formando mínima.
8. SEO completo: OG, hreflang, canonical, JSON-LD, sitemap corrigido.
9. Correcções de bugs: 404, favicon, switcher de idioma, sitemap, formulário, `AUTH_SECRET`.

**Fora de âmbito (YAGNI)**
Inscrições com pagamento (Fase 7 completa), CRM (Fase 8), analytics, service worker, WebGL/three.js, dark mode, Storybook, multi-tenant.

## 3. Decisões fechadas (utilizador, 2026-10-29)

| Decisão | Escolha |
|---|---|
| Área do formando | Mínima + admin em cards |
| Imagens | `gpt-image-2` via OpenAI + assets reais do repo |
| Slider do header | Ticker de texto no topo + slider de imagens no hero |
| Deploy | Preparar tudo; deploy bloqueado até resolução do Supabase |
| Créditos OpenAI | Sem créditos (`insufficient_quota`, verificado 2026-10-29) → o corpus determinístico é o caminho garantido; a camada LLM é opcional e auto-desactivada sem quota |
| Imagens | Assets reais do repo + arte 3D gerada localmente (SVG/CSS, sem API); imagens IA opcionais quando houver quota |

## 4. Fundação de design

### 4.1 Tokens (`src/app/[locale]/globals.css`, Tailwind v4 `@theme`)

- **Primitivos**: escala neutra 50→950 (azulada), `primary` 50→900, `accent` 50→900, derivadas de `#0054AE` / `#E41620`.
- **Semânticos**: `--surface`, `--surface-muted`, `--border`, `--border-strong`, `--ink`, `--ink-secondary`, `--ink-muted`, `--overlay`, `--success`, `--warning`, `--error` + variantes `-bg`.
- **Componente**: `--radius-sm|md|lg|xl`, `--shadow-xs|sm|md|lg`, `--ring-focus`.
- **Tipografia**: `--font-display` (Source Serif 4), `--font-sans` (Inter), `--font-mono`.
- Escala 12→60px. Contentor `max-w-7xl`; texto corrido `max-w-[68ch]`; ritmo de secção 64px mobile / 96px desktop.
- Proibido valor literal de cor no JSX: passa a existir teste/lint que falha com `#hex` fora de `globals.css`.

### 4.2 Tipografia

`next/font/google` → `Source_Serif_4` (600/700, `--font-display`) + `Inter` (variable, `--font-sans`), subsets `latin`+`latin-ext`, `display: swap`, `adjustFontFallback: true`. Sem pedidos a CDN externo.

### 4.3 Regras de movimento (docs/07 §6–7)

- Só `transform` e `opacity`. Nunca `width/height/top/left`.
- Escalas: fast 120ms · base 200ms · slow 400ms. Entrada `cubic-bezier(0.22,1,0.36,1)`, standard `cubic-bezier(0.2,0,0,1)`.
- Parallax: máximo 3 camadas, deslocação ≤6% da altura, via `useScroll` + `transform`, desligado <768px e com `prefers-reduced-motion`.
- Tilt/rotação: máximo 2°. Imagens nunca interativas por cima de CTAs.
- `prefers-reduced-motion` respeitado por CSS **e** `useReducedMotion()`.

## 5. Arquitetura de componentes

### 5.1 Público

```
src/components/
  site-header.tsx          (client)  3 camadas; mega-menu; estado scrolled
  site-footer.tsx          (server)  4 colunas; barra inferior com social
  hero/
    hero-slider.tsx        (client)  carousel de imagens, crossfade+Ken Burns
    hero-slide.tsx
  scroll/
    parallax-layer.tsx     (client)
    tilt-card.tsx          (client)
    reveal.tsx             (client)  substitui src/components/reveal.tsx
    scroll-progress.tsx    (client)
  chat/
    chat-widget.tsx        (client)  bubble + drawer
    chat-message.tsx
    chat-quick-replies.tsx
  ui/                     button-link, card, badge, icon-button, kpi-card, empty-state, skeleton, toast
  views/                  about, services, training, news, contact, service-detail, student-*
```

### 5.2 Header — 3 camadas

**Camada 0 — ticker de texto** (36px, fundo ink, texto branco): carousel de 4 mensagens (certificação ANPG, 11–50 especialistas, desde 2016 em Luanda, certificados homologados INEFOP). Crossfade com `AnimatePresence`, loop infinito, pausa em hover/foco, `aria-live="off"`, `aria-hidden` no texto rotativo (mensagem acessível só na versão visual). Desktop e mobile com conjuntos de mensagens distintos.

**Camada 1 — barra principal**: altura 80px → 64px em scroll (`scrolled` + sombra `md`). Wordmark real (desktop) / marca quadrada (mobile). Nav: Sobre, Serviços (mega-menu 6), Formação (mega-menu 3 famílias), Notícias, Contactos. Comutador PT/EN via **mapa de equivalência de slugs** (`/pt/sobre` ⇄ `/en/about`). CTA primário "Fale Connosco" → `/#contactos`. `aria-current="page"`.

**Camada 2 — drawer mobile**: `AnimatePresence`, backdrop, focus trap, `Esc` fecha, scroll lock, ícones Lucide.

### 5.3 Hero slider

- Slides em `public/hero/` (`hero-01.jpg`…`hero-04.jpg`), **slots do utilizador**; fallback gerado por IA.
- Cada slide: overlay `ink` → transparente, kicker, H1 serif, parágrafo, 2 CTAs.
- Transição crossfade 600ms + Ken Burns (scale 1.0→1.08, 8s).
- Parallax 3D no scroll: `useScroll` → `translate3d(0, y, 0)` + `rotateX` ≤2°.
- Dot navigation + barra de progresso; `aria-roledescription="carousel"`, `aria-live="polite"` no slide activo, swipe em touch, setas do teclado.
- Pausa automática com `prefers-reduced-motion` (não autoplay).

### 5.4 Rodapé — único ponto de redes sociais

4 colunas: (1) wordmark + badge ANPG + "Desde 2016 · Luanda, Angola" + especialidades; (2) navegação + Privacidade + Termos; (3) os 6 serviços; (4) contacto (morada, telefone, email, WhatsApp, Maps).
Barra inferior: ícones sociais Lucide (LinkedIn, Facebook, Instagram, WhatsApp) **exclusivamente aqui**, `© 2016–2026`, links legais, back-to-top.
**Regra dura:** nenhum outro componente pode renderizar ícones de redes sociais. Implementado como componente único `<SocialLinks>` importado apenas pelo rodapé.

### 5.5 WhatsApp concentrado

Um único `<FloatingContact>` (canto inferior direito) abre mini-painel com 3 acções: WhatsApp, telefone, email. Todos os botões WhatsApp existentes são removidos e substituídos por link a `#contactos` ou `tel:`.

## 6. Chatbot

### 6.1 Motor de resposta — dois caminhos

O corpus determinístico é **sempre** o caminho funcional. A camada LLM é um **upgrade opcional**.

**Caminho A — motor determinístico (garantido, 0 custo, sem rede)**
`src/lib/chat/engine.ts` — retrieval híbrido sobre o corpus:
1. Normaliza a pergunta (lowercase, remove acentos, remove stopwords pt/en).
2. Pontua cada entrada do corpus por sobreposição de tokens (peso IDF) + match de sinónimos configurados.
3. Devolve a melhor entrada acima do limiar (`SCORE_THRESHOLD = 0.18`) com a resposta e a(s) fonte(s) (`service:contabilidade-geral`, `faq:inscricoes`).
4. Abaixo do limiar → resposta honesta: "Não encontrei essa informação nos nossos conteúdos publicados" + atalhos para serviços, formação e contacto.

**Caminho B — camada LLM (opcional, activada só com quota)**
`src/app/api/chat/route.ts` — Route Handler, streaming SSE, modelo `gpt-5-mini` (fallback `gpt-4o-mini`), `OPENAI_API_KEY` só no servidor.
- Activação: `OPENAI_API_KEY` presente **e** o último teste de quota não tiver falhado (cache em memória, 10 min).
- Corpus injectado como documento delimitado; o modelo só responde a partir dele.
- Se a chamada LLM falhar (429/quota/timeout) → degradação transparente para o Caminho A, com a mesma resposta e as mesmas fontes. O visitante nunca vê erro de quota.
- A chave nunca chega ao cliente; o modelo é invocado pelo servidor.

**Resposta da API**: `{ answer: string; sources: string[]; mode: 'corpus' | 'llm' | 'fallback' }`. O `mode` é usado só em telemetria interna, nunca apresentado como "IA" ao visitante.

### 6.2 Corpus autorizado

`src/content/knowledge.ts` — gerado a partir de `src/content/services.ts` (empresa, serviços, formação, ANPG), das FAQs (tabelas `Faq`/`FaqTranslation`, `docs/08`) e da política comercial (contactos, horário,localização). Serializado num prompt delimitado por marcadores; o modelo só responde a partir dele.

### 6.3 Segurança

- Anti-injection: conteúdo do utilizador nunca entra como instrução; delimitações explícitas + system prompt de "apenas responde a partir do corpus".
- Proibido revelar dados privados (passwords, tokens, dados de clientes, outras sessões).
- Rate limit: 20 mensagens / 5 min por hash de IP (reutiliza `src/lib/rate-limit.ts`).
- Sanitização de PII nas mensagens persistidas (`src/lib/chat/redact.ts`).
- Fallback determinístico **é** o Caminho A, não um plano B: o sistema funciona integralmente sem rede.

### 6.4 UI

Bubble fixo (canto inferior esquerdo, acima do botão flutuante de contacto), drawer com histórico, quick-replies, estado de "a escrever" com skeleton, bilingue pt/en, `aria-live="polite"`, erro com acção "Tentar novamente", link permanente "Falar com um consultor" (telefone/WhatsApp).

### 6.5 Persistência

Novos modelos `ChatConversation` (locale, ipHash, userAgent, createdAt) e `ChatMessage` (role, content, tokens, createdAt). Admin vê a inbox em cards.

## 7. Dashboards

### 7.1 Admin (`/pt/admin`)

Shell: sidebar colapsável + topbar (busca, perfil, logout). Cards de KPI (novos contactos, inscrições activas, conversas do chatbot, health do sistema). Grid de cards por módulo: Contactos (inbox real desde a tabela `ContactMessage`), Utilizadores (RBAC), Cursos, FAQs, Conversas. Estados vazios honestos, skeletons de loading, toasts de acção, `aria-label` correctos. A acção de responder um contacto grava `handledAt`/`handledById`.

### 7.2 Formando (`/pt/area`)

Login próprio (mesmo Auth.js, role `STUDENT`). Cards: "Minhas formações" (progresso, próximas sessões, materiais), "Certificados", "Pagamentos" (read-only nesta fase). Onboarding com estado vazio.

### 7.3 RBAC e dados

Novos roles `STUDENT`, `INSTRUCTOR`. MFA obrigatório apenas para `ADMIN`. Novos modelos: `Course`, `Enrollment`, `Attendance`, `Certificate`, `Material`. Migração Prisma + seed de demonstração.

## 8. Assets e pipeline de media

| Ambiente | Origem | Destino | Uso |
|---|---|---|---|
| Desktop header | `logotipos/logo_para_cabeçalho_site-removebg-preview.png` | `public/brand/cts-wordmark.png` | barra principal, rodapé, OG |
| Mobile | `logotipos/logo_para_mobile-removebg-preview.png` | `public/brand/cts-mark.png` | header mobile, drawer, favicon app |
| App / PWA / OG | `logotipos/logo_favicon-removebg-preview.png` | `public/icons/*`, `src/app/icon.png` | favicon, apple-touch, manifest, OG |

- `next/image` com `formats: ['image/avif','image/webp']`, `sizes` correctos, `priority` só no primeiro slide.
- Retrato do CEO (2,1 MB PNG) convertido para AVIF/WebP responsivo.
- Assets reais aproveitados: `eventos/` (5 fotos), `panfletos/` (12), `parceiros/` (3 logos) — galeria de formação e faixa de parceiros.
- Imagens geradas **localmente** (sem API): fundos 3D abstractos e uma arte por secção de serviço, produzidos como SVG + gradientes CSS com a paleta da marca (técnica `algorithmic-art`, determinística com seed). Ficheiros em `public/brand/backgrounds/`.
- Imagens por IA (`gpt-image-2`) são **opcionais**: só são usadas quando existir quota; o prompt de cada uma fica em `docs/24-image-prompts.md` para reprodutibilidade. Os slots do hero aceitam ficheiros do utilizador sem alterar código.

## 9. SEO e metadata

- `metadataBase` a partir de `SITE_URL`; OpenGraph completo + `og:image` gerada; Twitter Card; `alternates.languages` (`pt-PT`, `en`, `x-default`); canonical; `icons`.
- `src/app/sitemap.ts`: usar `SECTIONS[section][locale]`, `lastModified` estável, hreflang por entry.
- JSON-LD: `Organization` (com `logo`/`sameAs`), `LocalBusiness`, `Service` ×6, `Course`, `FAQPage`, `BreadcrumbList`.
- `robots.ts`: desallow `/admin/`, `/api/`; header `X-Robots-Tag: noindex` em `/admin` e `/api`.
- `manifest.ts`: `background_color: '#FFFFFF'`, `theme_color: '#0054AE'`.
- Páginas de estado: `not-found.tsx` (raiz e grupo público, JSX + `export const metadata`), `error.tsx`, `global-error.tsx`, `loading.tsx`.

## 10. Acessibilidade (WCAG 2.2 AA)

Contraste AA verificado por par de token; foco sempre visível; skip-link; ordem de tabulação lógica; `Esc` em overlays; alvos ≥44px; `<html lang>` por locale; 1 `h1` por página; landmarks correctos; `aria-current` na nav; `aria-describedby`/`aria-invalid` no formulário; foco no primeiro campo inválido; `role="alert"` em erros; `aria-live` em conteúdo assíncrono; `scroll-padding-top` para saltos por baixo do header fixo; zoom 200% sem perda; reflow a 320px; `alt` real em todas as imagens.

## 11. i18n

Todo o copy público migra para `messages/pt.json` e `messages/en.json` com namespaces: `nav`, `home`, `about`, `services`, `training`, `news`, `contact`, `footer`, `chatbot`, `admin`, `student`, `legal`, `common`.
Desaparecem as ternaries `locale === 'pt' ? … : …` nos views. `src/content/services.ts` deixa de renderizar e passa a ser **fonte do corpus** do chatbot.
Mapa de equivalência de slugs por locale em `src/content/routes.ts` (`SECTION_BY_LOCALE` + `SLUG_EQUIVALENTS`).

## 12. Erros e observabilidade

- `error.tsx` público com mensagem pt/en e `requestId`; nunca stacktrace.
- Chatbot: erro → fallback determinístico → se falhar, mensagem de contacto directo.
- Formulário: mensagem de erro específica do servidor (Zod/rate-limit/honeypot) mostrada ao utilizador; `aria-live`.
- `src/lib/audit.ts` regista acções admin sensíveis (login, logout, resposta a contacto, alterações RBAC).
- `console.error` com contexto, sem PII.

## 13. Testes

- **Unit**: mapa de slugs por locale (switcher); redacção de PII; rate limit do chat; correspondência lexical do fallback FAQ.
- **Componente**: `SiteHeader` (ticker, estado scrolled, mega-menu, drawer); `LanguageSwitcher` (mapeamento correcto); `HeroSlider` (auto-advance, dots, reduced-motion); `ChatWidget` (streaming, erro, fallback, quick-reply).
- **E2E (Playwright)**: `/pt` ⇄ `/en` em deep-links (incl. `/pt/sobre` → `/en/about` sem 404); envio de contacto persiste; chatbot responde em pt e en; login admin → dashboard; login formando → área; 404 devolve página com título.
- **Regressão visual**: 1440 / 768 / 390 px × pt/en nas rotas principais.
- **Lint/typecheck/build** obrigatórios antes de qualquer commit: `npm run lint`, `npm test`, `npm run typecheck`, `npm run build`.

## 14. Ficheiros

**Novos** — `src/components/hero/*`, `src/components/scroll/*`, `src/components/chat/*`, `src/components/ui/{card,badge,icon-button,kpi-card,empty-state,skeleton,toast,social-links}.tsx`, `src/components/floating-contact.tsx`, `src/app/api/chat/route.ts`, `src/content/knowledge.ts`, `src/content/routes.ts` (expandido), `src/app/[locale]/area/**`, `src/app/[locale]/(public)/privacidade/page.tsx`, `src/app/[locale]/(public)/termos/page.tsx`, `src/app/icon.png`, `src/app/{error,global-error,loading}.tsx`, `src/app/not-found.tsx`, `public/brand/*`, `public/hero/*`, `prisma/migrations/*`, `docs/24-image-prompts.md`.

**Alterados** — `src/app/[locale]/globals.css`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/(public)/layout.tsx`, `src/app/[locale]/(public)/page.tsx`, `src/app/[locale]/(public)/[section]/page.tsx`, `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `src/components/contact-form.tsx`, `src/components/views/*`, `src/app/sitemap.ts`, `src/robots.ts`, `src/manifest.ts`, `next.config.ts`, `prisma/schema.prisma`, `messages/pt.json`, `messages/en.json`, `.env.example`.

## 15. Critérios de aceitação

1. `npm run lint`, `npm test`, `npm run typecheck`, `npm run build` — todos verdes, exit 0.
2. `/pt` e `/en` renderizam com slider, ticker, scroll 3D e rodapé de 4 colunas com social único.
3. Comutador de idioma funciona em **todas** as rotas (incl. detalhe de serviço) sem 404.
4. `/pt/servicos/<slug>` responde 200 e o sitemap contém URLs PT e EN correctos.
5. Favicon 200 (zero 404 no log); `not-found` devolve página válida.
6. Chatbot responde a 3 perguntas de empresa/formação em pt e en; recusa perguntas sobre dados privados; rate limit activo.
7. Login admin mostra dashboard em cards com KPIs reais; login formando mostra a área do formando.
8. Ícones de redes sociais existem **apenas** no rodapé; WhatsApp existe **apenas** no botão flutuante.
9. Zero erros no log do servidor durante navegação completa em pt e en.
10. Lighthouse ≥90 em performance, SEO e acessibilidade nas rotas públicas.

## 16. Riscos

| Risco | Mitigação |
|---|---|
| **Postgres Supabase inacessível** (`db.wwcqditgbpstqcpxtrrk.supabase.co` não resolve em DNS; MCP aponta para `kztglgauxmtuliykeljy`, também inacessível) | Bloqueio de infraestrutura. O utilizador cria/repõe o projecto e actualiza `DATABASE_URL`. Migrations e deploy ficam pendentes até isso. |
| Imagens do hero pelo utilizador com dimensões/cores inconsistentes | Slots com `aspect-ratio` fixo + overlay ink que uniformiza; fallback IA; validação de ficheiro no script de build. |
| Custo da API OpenAI | Quota actual = 0 (verificado). O Caminho A (corpus determinístico) é o caminho garantido e cobre 100% das perguntas sobre empresa e formação. O Caminho B é um upgrade automático quando a quota existir. Teste de quota em cache de 10 min evita 429 em loop. |
| Chatbot alucina sobre a empresa | Caminho A só devolve texto verbatim do corpus, com fontes. Caminho B tem corpus delimitado + prompt de recusa + teste negativo obrigatório (`docs/21` Fase 9). Em caso de falha, degradação para Caminho A. |
| Peso do bundle com animações | `motion` já instalado; componentes client isolados por secção; sem `framer-motion`. |
| Vercel sem CLI/token | Deploy prepared (`vercel.json`, `.env.example`), login pelo utilizador via `npx vercel`. |

## 17. Ordem de execução

1. Tokens + tipografia + correcções de bug (404, favicon, sitemap, switcher, formulário, `AUTH_SECRET`).
2. i18n (migrar copy para `messages/` + mapa de slugs).
3. Header (3 camadas) + rodapé (4 colunas, social único) + botão flutuante.
4. Hero slider + scroll 3D + views das páginas.
5. Logos por ambiente + pipeline `next/image` + assets reais + imagens IA.
6. Chatbot (API + corpus + UI + persistência + inbox admin).
7. Dashboards admin (cards) e formando (+ modelos Prisma + seed).
8. SEO + metadata + JSON-LD + páginas de estado.
9. Testes (unit, componente, E2E, visual) + lint/typecheck/build.
10. Git commit por fase; `git push`; deploy Vercel (bloqueado até Supabase resolvido).
