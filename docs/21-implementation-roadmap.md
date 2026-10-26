# 21 — Plano de Implementação por Fases

> Data: 2026-10-26 · Estimativas em dias de trabalho (1 dev sénior full-stack; escalar ~2× com 2 devs em paralelo).
> Regra: nenhuma fase se declara concluída sem evidência (lint ✅, testes ✅, build ✅, verificação manual dos critérios).

---

## Fase 1 — Auditoria ✅ (concluída 2026-10-26)

| Tarefa | Estado |
|---|---|
| Inspecção do repositório/directório local | ✅ doc 01 |
| Análise do website actual | ✅ doc 02 |
| Análise do AngoAPI | ✅ (inacessível — bloqueio registado) doc 03 |
| Inventário de recursos gráficos + cores da marca | ✅ doc 01 §2.4, doc 02 Anexo A |
| Análise das bibliotecas de design | ✅ doc 04 §7 |
| Identificação de funcionalidades necessárias | ✅ doc 05 |

**Entregável**: docs 01–05 + doc 21 + doc 23. **Dependências**: nenhuma. **Riscos**: nenhum.

## Fase 2 — Arquitectura e documentação de detalhe (~3 dias)

Depende: aprovação humana das decisões da doc 04 e respostas à doc 23.

- Desenho completo da base de dados (`docs/08-database-design.md`, diagrama ER).
- Especificação de API (`docs/09-api-specification.md`).
- Definição de permissões (matriz perfil × acção).
- Modelo de ameaças (`docs/10-security-threat-model.md`).
- Design system (`docs/07-ui-ux-design-system.md`) a partir das cores reais do logótipo (#0054AE / #E41620 / #000000).
- Sitemap e navegação bilingue (`docs/06-sitemap-and-navigation.md`).
- Critérios de aceitação (`docs/22-acceptance-criteria.md`).

**Critério de aceitação**: todas as doc's de detalhe revistas; diagramas Mermaid coerentes; zero perguntas críticas em aberto para iniciar a Fase 3.

## Fase 3 — Fundação técnica (~5 dias)

- Scaffold Next.js + TS + Tailwind + Biome + ESLint de segurança; estrutura de pastas; `next-intl` (pt-PT/EN) operacional.
- PostgreSQL + Prisma: schema núcleo (users, roles, permissions, sessions, audit_logs, notifications_queue).
- Auth (Auth.js credentials + sessões + MFA TOTP admin + recuperação de password) e RBAC no servidor.
- Migrações + seed (superadmin criado por fluxo seguro, nunca credencial fixa).
- Rate limiting, cabeçalhos de segurança, tratamento de erros sanitizado.
- Testes: unitários do núcleo auth/RBAC + primeiro E2E Playwright (login, logout, access denied).
- CI (GitHub Actions): install → lint → test → build → `npm audit` → scan de segredos.

**Critérios de aceitação**:
1. `npm install && npm run dev` sobe o site em pt-PT e EN (comutador funciona).
2. Login/logout/MFA funcionam; sessão expira; revogação possível.
3. Utilizador sem permissão recebe 403 em acção protegida (teste E2E).
4. CI verde; nenhum segredo no repositório (gitleaks limpo).
5. `.env.example` completo e README de instalação local validado por terceiro.

## Fase 4 — Sistema visual (~4 dias)

- Tokens de design (paleta CTS real, tipografia, escala, raios, sombras, breakpoints).
- Componentes base: botões, campos, cartões, modais, tabelas, toasts, estados vazios/loading/erro, breadcrumbs, paginação.
- Header/footer/navegação bilingue, mobile menu.
- Animações com Motion (entradas de secção, microinteracções, `prefers-reduced-motion`); selecção de componentes Animate UI/UI Layouts.

**Critério**: biblioteca de componentes documentada Storybook-style (ou página `/styleguide`) + visual check desktop/tablet/mobile.

## Fase 5 — Website público (~6 dias)

- Início, Sobre Nós, Serviços (+página por serviço), Formação (+página por curso), Contactos, Notícias (estrutura).
- Conteúdo real migrado da doc 02; imagens optimizadas (AVIF/WebP).
- Formulários com validação + persistência + email.
- SEO (sitemap, robots, hreflang, OG, JSON-LD), páginas de erro, 301s reais.
- PWA (manifest, ícones, SW leve, convite de instalação não intrusivo).

**Critério**: todos os fluxos públicos E2E verdes (visitar curso, enviar contacto, trocar idioma); Lighthouse ≥ 90 em perf/SEO/a11y.

## Fase 6 — Administração (~7 dias)

- Dashboard com indicadores reais (estados vazios honestos).
- RBAC aplicado a todos os módulos; gestão de utilizadores/perfis.
- CMS: páginas/blocos, serviços, cursos, notícias, FAQs, menus, SEO, multimédia.
- Auditoria de operações críticas.

**Critério**: Fluxo C E2E (criar → pré-visualizar → publicar página → visível no site, em ambos os idiomas).

## Fase 7 — Inscrições e pagamentos (~7 dias)

- Formulário de inscrição, número único, estados, histórico.
- Upload privado de comprovativos (magic bytes, tamanho, URL assinado).
- Validação/aprovação/rejeição com auditoria; controlo de vagas transaccional.
- Confirmação de inscrição com código de verificação; presenças (pesquisa/QR).
- Recibos/documentos; emails transaccionais.

**Critério**: Fluxo A E2E completo (10 passos) + teste de concorrência de vagas.

## Fase 8 — CRM e integrações (~4 dias)

- Clientes, pedidos de serviço, estados, histórico, documentos.
- Adaptador AngoAPI pronto (flag desligada) + `IntegrationSyncLogs`.
- Notificações administrativas.

**Critério**: Fluxo B E2E.

## Fase 9 — Chatbot e analytics (~4 dias)

- Base de conhecimento a partir dos conteúdos publicados; endpoint de chat com ferramentas limitadas; defesas anti-injection; UI bilingue.
- Administração de conversas; eventos de analytics + dashboard.

**Critérios**: Fluxo D E2E; chatbot nunca revela dados privados (teste negativo).

## Fase 10 — Segurança e qualidade (~4 dias)

- Bateria de testes de autorização (10 testes mínimos da doc briefing §20).
- Ferramentas: Semgrep, Gitleaks, Trivy, `npm audit`, OWASP ZAP (apenas local/staging).
- Desempenho (Lighthouse, optimização), acessibilidade (teclado, contraste, leitores de ecrã).
- Relatório `docs/24-security-test-report.md` com resultados reais (sem inventar).

## Fase 11 — Publicação (~2 dias)

- Revisão final, docs actualizadas, build de produção.
- Commits pequenos + push para `Masukulmiguel/cts-consultoria` (verificando diff, lint, testes, segredos).
- Deployment: VPS ou Vercel (a decidir), HTTPS, domínio, migração, backups com teste de restauro, monitorização, health check, rollback.

---

## Resumo de esforço

| Fase | Dias estimados | Dependências externas |
|---|---|---|
| 1 Auditoria | ✅ 0 | — |
| 2 Arquitectura | 3 | Aprovação do stack + Qs da doc 23 |
| 3 Fundação | 5 | Credenciais GitHub/BD |
| 4 Sistema visual | 4 | — |
| 5 Website público | 6 | Conteúdo final confirmado (cursos, preços, contactos) |
| 6 Administração | 7 | — |
| 7 Inscrições/pagamentos | 7 | Decisão sobre provedor de pagamentos (Q4) |
| 8 CRM/integrações | 4 | Acesso AngoAPI (Q1) — não bloqueante |
| 9 Chatbot/analytics | 4 | Chave de IA (Q7) |
| 10 Segurança/qualidade | 4 | — |
| 11 Publicação | 2 | Alojamento/DNS (Q3) |
| **Total** | **~46 dias** | |

**Primeira fase de desenvolvimento após aprovação**: Fase 3 (Fundação técnica), precedida da Fase 2 (documentação de detalhe).
