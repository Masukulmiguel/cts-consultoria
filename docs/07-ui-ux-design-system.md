# 07 — UI/UX Design System

> **Fase 2 — 2026-10-26** · Cores extraídas do logótipo real (doc 01 §2.4): **azul `#0054AE`**, **vermelho `#E41620`**, **preto `#000000`**. O site actual usa navy/vermelho divergentes (`#0B2A5B`/`#A60303`) — **não usar** (doc 01 P8).
> Stack: Tailwind v4 (tokens em CSS variables), Radix/shadcn, Motion (docs 04 §2).

## 1. Cor — tokens

| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#0054AE` | botões primários, links, foco, marca |
| `--primary-hover` / `--primary-active` | `#00469A` / `#00377A` | hover/pressed |
| `--primary-tint` | `#EAF2FB` | fundos de destaque suaves, badges |
| `--accent` | `#E41620` | acento de marca, CTAs de destaque, sublinhados |
| `--accent-hover` / `--accent-soft` | `#C4121B` / `#FDE3E4` | hover / fundo suave |
| `--destructive` | `#E41620` (fundo, texto branco) | eliminar/invalidar (exige confirmação) |
| `--destructive-text` | `#C4121B` | texto de erro sobre branco |
| `--ink` | `#0B1B2F` | **texto principal** (navy, ~17:1 vs branco) |
| `--ink-secondary` / `--ink-muted` | `#37415C` / `#5C6880` | texto secundário/legendas (≥ AA verificado) |
| `--black` | `#000000` | títulos de peso máximo / fundos de imagem com overlay |
| `--background` / `--surface` / `--surface-muted` | `#FFFFFF` / `#F7F9FC` / `#EEF1F6` | páginas, cartões, linhas de tabela |
| `--border` / `--border-strong` | `#E1E6EF` / `#CBD3E0` | divisórias |
| `--success` / `--success-bg` | `#157347` / `#E7F5EE` | pagamento aprovado, inscrição aprovada |
| `--warning` / `--warning-bg` | `#B45309` / `#FEF3C7` | a aguardar validação, correcção pedida |
| `--error` / `--error-bg` | `#C4121B` / `#FDE3E4` | erros de validação, rejeições |
| `--info` | `#0054AE` | avisos informativos (via primary) |
| `--overlay` | `rgba(11,27,47,.60)` | fundo de modal/drawer |

**Escala neutra derivada** (50→950, ligeiramente azulada): `#F7F9FC · #EEF1F6 · #E1E6EF · #CBD3E0 · #9AA6BC · #6B7794 · #4C5872 · #37415C · #1F2942 · #121A31 · #0B1B2F`. Escalas `primary` e `accent` geradas a partir dos 2 hex reais (50/100/…/900) — nunca inventar tons fora da família.

**Contraste mínimo WCAG AA** (4,5:1 texto normal; 3:1 grande/UI): `#0054AE`≈7,3:1 vs branco ✅ · `#E41620`≈4,7:1 vs branco ✅ (usar **texto branco sobre vermelho, nunca preto** ≈4,4:1 ❌) · `#0B1B2F`≈17:1 ✅. Todos os pares token-a-token verificados por teste automatizado de contraste em CI.

## 2. Tipografia — pareamento

**Escolha: `Source Serif 4` (títulos) + `Inter` (corpo/UI)**, ambos Google Fonts/OFL, **self-hosted via `next/font`** (doc 05 §4: sem pedidos a CDNs externos, sem CLS).

- *Source Serif 4* 600/700: dá autoridade institucional/editorial a uma consultoria e **já é usada no site actual** (doc 02 §6) — continuidade de identidade.
- *Inter* variável (1 ficheiro, subset `latin + latin-ext` para pt-PT): legibilidade em 14–16 px, óptima em formulários/tabelas, **numerais tabulares** para valores financeiros (AOA), pesos 400/500/600/700.
- Alternativa avaliada: `IBM Plex Sans` como corpo (continuidade técnica) — mantida apenas como fallback.

**Escala** (razão ~1,25): `12 · 14 · 16 · 18 · 20 · 24 · 30 · 36 · 48 · 60 px` → `text-xs … text-6xl`. Line-height: corpo 1,6; títulos 1,15–1,3. Pesos: 400 corpo, 500 labels/botões, 600 títulos, 700 display. Mono (`ui-monospace`): números de inscrição, recibos, códigos de verificação.

## 3. Espaçamento, raios, sombras, grelha

- **Espaçamento**: escala Tailwind (base 4 px): `0,1,2,3,4,6,8,10,12,16,20,24` → 0–96 px. Ritmo vertical de secção: 64 px (mobile) / 96 px (desktop).
- **Raios**: `--radius-sm` 4 px (badges), `--radius` 8 px (inputs, botões, cartões), `--radius-lg` 12 px (modais, hero), `--radius-xl` 16 px (painéis), `9999` (pills/avatars).
- **Sombras** (neutras navy, nunca pretas duras): `xs 0 1px 2px rgba(11,27,47,.06)` · `sm 0 1px 3px rgba(11,27,47,.08)` · `md 0 4px 12px -2px rgba(11,27,47,.10)` · `lg 0 12px 32px -8px rgba(11,27,47,.16)` · foco: `0 0 0 2px #FFF, 0 0 0 4px #0054AE`.
- **Breakpoints**: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Mobile-first.
- **Containers**: público `max-w-7xl` (1280) com padding 16/24/32 px; texto corrido `max-w-[68ch]`; admin `max-w-[1600px]`; formulários `max-w-2xl`.

## 4. Ícones

**Lucide** (`lucide-react`) — já usado no site actual (via CDN → agora npm, doc 02 §6). Tamanhos 16/20/24, stroke 1,75. Decorativos: `aria-hidden="true"`; informativos isolados: `aria-label` obrigatório. Nunca emoji como ícone de UI. Cores: `currentColor` (herdam do contexto).

## 5. Especificação de componentes

| Componente | Especificação |
|---|---|
| **Botão** | Variantes: `primary` (fundo `#0054AE`, texto branco), `secondary` (outline primary), `accent` (fundo `#E41620`, uso pontual), `ghost`, `subtle`, `destructive`. Tamanhos sm 32 / md 40 / lg 48 px. Estados: hover, active, `focus-visible` (ring 2 px), disabled (45% opac), **loading** (spinner + `aria-busy`, largura preservada) |
| **Campo** | Label **acima** sempre visível + `required` ("obrigatório", não só `*`); hint ou erro **debixo**, ligado por `aria-describedby` + `aria-invalid`; prefixo/sufixo (moeda AOA, telefone); máx. 640 px; input 40 px |
| **Cartão** | `surface`, borda 1 px `--border`, raio 8, padding 24; hover eleva `sm→md` (transform/opacity); cartão de curso/serviço com imagem 16:9 AVIF/WebP |
| **Modal/Drawer** | Radix Dialog: overlay `--overlay`, focus-trap, `Esc` fecha, foco devolvido ao gatilho, `aria-labelledby` obrigatório; confirmação sempre em acções destrutivas |
| **Tabela** | Header sticky `surface-muted`, linhas 48 px, `font-variant-numeric: tabular-nums`, acções em coluna final; filtros+pesquisa no topo; mobile → cartões empilhados; estados: carregando (skeleton), vazio, erro |
| **Toast** | Canto inferior direito, 5 s (erros: até 8 s), máx. 3 simultâneos, `role="status"` (erros `role="alert"`), acção "desfazer" quando aplicável |
| **Estado vazio** | Ícone Lucide 32 + título + frase honesta + acção primária ("Ainda não há inscrições") |
| **Loading** | Skeleton imitando a layout (nunca spinner a 100 %); `aria-busy` + texto p/ leitor de ecrã |
| **Erro** | Mensagem em pt-PT claro + botão "Tentar novamente" + `requestId` para suporte; nunca stacktrace |

## 6. Movimento (Motion — `motion/react`)

- **Princípios**: dar feedback e orientar hierarquia; nada anima sem função. Só **`transform` e `opacity`** (GPU); nunca animar `width/height/top/left` (CLS/jank).
- **Escalas**: fast 120 ms · base 200 ms · slow 400 ms. Easing: entrada `cubic-bezier(0.22,1,0.36,1)`, standard `cubic-bezier(0.2,0,0,1)`.
- Padrões: fade+8 px ao entrar em secção (stagger máx. 6 itens), micro-interacções em botões (scale ≤1,02), transição de comutador de idioma (crossfade 150 ms), saídas via `AnimatePresence`.
- **`prefers-reduced-motion`**: desactiva parallax, stagger, smooth-scroll e transições não essenciais (mantém fade ≤100 ms); respeitado por CSS **e** `useReducedMotion()` (doc 02 §6 — manter padrão já presente).

## 7. Regras 3D / parallax

- Parallax **apenas** na hero (e opcionalmente na barra de factos), máx. 3 camadas, deslocação ≤ 6 % da altura, `translate3d`, desactivado em `<768px` e com reduced-motion.
- Sem WebGL/three.js na fase 1 (doc 04 §7: evitar dependências pesadas; qualquer 3D futuro exige justificação documentada).
- Rotações/tilt: máx. 2°; imagens nunca interactivas por cima de CTAs; scroll-linked sempre via `useScroll` + `transform`.

## 8. Acessibilidade (WCAG 2.2 AA)

1. Contraste AA em todos os pares de texto/fundo (teste em CI) + 3:1 em bordas, ícones de estado e foco.
2. `focus-visible` sempre visível (ring primary 2 px, offset 2 px; branco sobre fundos escuros) — nunca `outline: none` sem substituto.
3. Navegação 100 % por teclado: skip-link, ordem de tabulação lógica, `Esc` em overlays, alvos ≥ 44 px.
4. Semata correcta: `<html lang>` por locale, 1 `h1`/página, landmarks (`header/nav/main/footer`), `aria-current` na navegação, labels ligados aos campos.
5. Anúncios: erros de formulário via `role="alert"` e foco no primeiro campo inválido; `aria-live` em actualizações assíncronas.
6. Zoom 200 % sem perda de conteúdo; reflow a 320 px; imagens com `alt` real (vazio só se decorativa).
