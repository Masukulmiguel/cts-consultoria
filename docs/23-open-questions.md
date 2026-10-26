# 23 — Perguntas e Decisões em Aberto

> Actualizado: 2026-10-26 (2.ª ronda — decisões aprovadas)

## ✅ Decisões aprovadas pelo cliente (2026-10-26)

| # | Decisão |
|---|---|
| D1 | **Stack aprovada** (doc 04): Next.js 15 + TS + Tailwind + Radix/shadcn + Motion · PostgreSQL + Prisma · Auth.js com MFA · next-intl (pt-PT/EN) |
| D2 | **Bilinguismo**: site público bilingue pt-PT/EN; **admin em pt-PT** na fase inicial |
| D3 | **Locale base: pt-PT** (fallback de traduções em falta) |
| D4 | **Pagamentos: validação manual primeiro** (sem integração Multicaixa na fase inicial; adaptador preparado para futuro) |
| D5 | Seguir com Fase 2 e Fase 3 imediatamente |
| D6 | Bilinguismo obrigatório (pedido directo do cliente, 26/10) |

## Pendentes (não bloqueiam a Fase 3)

| # | Pergunta | Porquê é importante | Opções |
|---|---|---|---|
| Q1 | ~~AngoAPI~~ **Resolvido (26/10)**: repo `Masukulmiguel/angoapi` analisado (doc 03) — é um gateway de APIs Laravel, **não** tem formandos/cursos/clientes. Decisão: CTS independente na fase inicial. Apenas resta para a empresa: **rotacionar as credenciais expostas** no `.env.production` (doc 03 §8, B1) e confirmar se quer o fluxo Multicaixa/BitPay para pagamentos (ligado a Q4). |
| Q2 | **Aprovação do stack** (doc 04): Next.js + PostgreSQL + Prisma + Auth.js, bilingue pt-PT/EN, admin em pt-PT | Prisma torna-se difícil de reverter após migrações | Aprovar / pedir alterações |
| Q3 | **Alojamento e domínio**: quem tem acesso ao DNS de `consultoriacts.com`? VPS (Hetzner/DigitalOcean) ou Vercel? | Fase 11; custos mensais | VPS / Vercel / indicar actual |
| Q4 | **Pagamentos**: a validação será manual (recomendado na fase inicial) ou quer integração com Multicaixa Express/EMIS/Unitel Money? | Fase 7; custos e complexidade | Manual primeiro / integrar já / indicar fornecedor |
| Q5 | **Email transaccional**: existe caixa `geral@consultoriacts.com` com acesso SMTP? Qual provedor? | Fases 5–7 (notificações) | Indicar provedor/acesso SMTP |

## Conteúdo a confirmar (bloqueia a Fase 5)

| # | Pergunta |
|---|---|
| Q6 | **Contactos oficiais**: quais são activos? (Website: 992 771 895 + WhatsApp 958 893 484. Panfletos: também 924 379 381, 955 771 895 e `geral@consultoriacts.com`.) Confirma-se o e-mail? |
| Q7 | **Chatbot com IA**: aprova uso de fornecedor de IA pago (custo variável) ou prefere FAQ estático na fase inicial? |
| Q8 | **"29 Associados"** no site — o que significa exactamente (clientes? membros?) para republicar correctamente? |
| Q9 | **Perfis do admin**: os perfis propostos (Superadmin, Administrador, Responsável de formação, Financeiro, Funcionário, Formando) correspondem à estrutura real? Quem terá acesso? |
| Q10 | **Cursos**: confirma o catálogo real (doc 02 Anexo B)? Preços, datas futuras, vagas, modalidade (presencial em Rangel?), e quer que as inscrições comecem a ser recebidas online desde o lançamento? Certificação INEFOP aplica-se a todos os cursos? |
| Q11 | **Bilinguismo no admin**: proposta — admin só em pt-PT. Aceita, ou quer admin bilingue? |
| Q12 | **Idioma pt-PT vs pt-AO**: o briefing pede "português de Angola" é pt-PT? O site actual usa `pt-AO`. Recomenda-se pt-PT no conteúdo institucional com naturalezas locais; confirmar preferência. |
| Q13 | **Redes sociais**: existem páginas oficiais (Facebook/Instagram/LinkedIn) a ligar? Nenhuma foi encontrada no site actual. |
| Q14 | **Parceiros**: os 3 logótipos em `parceiros/` podem ser publicados? Quem são? |
| Q15 | **Perguntas frequentes, testemunhos, notícias**: existe conteúdo real a publicar ou criamos a estrutura vazia para o administrador preencher? |
| Q16 | **Funcionários**: quer o módulo de gestão de funcionários desde já, ou só o registo básico? |

## Legal / conformidade

| # | Pergunta |
|---|---|
| Q17 | **Protecção de dados pessoais em Angola** (Lei n.º 22/11): existe assessoria jurídica para validar a política de privacidade, termos de uso e consentimentos? (Não afirmamos conformidade sem validação.) |
| Q18 | **Retenção de dados**: quanto tempo conservar inscrições, comprovativos, conversas do chatbot e logs? Propor default: ver doc 11 (a criar). |

## Git / publicação

| # | Pergunta |
|---|---|
| Q19 | Confirma-se autorização para publicar em `github.com/Masukulmiguel/cts-consultoria` (repositório actualmente vazio) e quem fará o `git push` (autenticação GitHub disponível nesta máquina)? |
