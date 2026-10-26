# 05 — Requisitos de Produto (Product Requirements)

> Data: 2026-10-26 · Estado: proposta à validação da empresa (doc 23)
> Fontes: pedidos do cliente (briefing), website actual (doc 02), panfletos (doc 02 Anexo B).
> **Regra permanente: nenhum dado institucional, curso, preço ou testemunho é publicado sem confirmação real.**

---

## 1. Visão

Plataforma web bilingue (pt-PT / EN) da CTS Consultoria Empresarial & Gestão de Negócios que: (a) apresenta a empresa, serviços e formação com identidade moderna; (b) permite **inscrições em cursos com gestão completa de pagamentos e confirmações**; (c) gere pedidos de serviço (CRM básico); (d) disponibiliza um painel administrativo seguro com RBAC; (e) ajuda visitantes com um chatbot baseado em informação autorizada.

## 2. Actors / Perfis

| Perfil | Descrição | Acesso |
|---|---|---|
| Visitante | Público em geral, pt-PT ou EN | Site público, formulários, chatbot, inscrição em cursos |
| Formando (registado) | Quem se inscreveu | Consulta as **próprias** inscrições, comprovativos, confirmações |
| Superadministrador | Direcção/administrador máximo | Tudo, incl. administração de contas e configuração |
| Administrador | Gestão operacional | Conteúdos, serviços, cursos, inscrições, clientes (conforme permissões) |
| Responsável de formação | Gestão de cursos/turmas | Cursos, turmas, inscrições, presenças, certificados |
| Financeiro | Validação financeira | Pagamentos, comprovativos, recibos, relatórios |
| Funcionário | Acesso restrito | Módulos atribuídos |

> Perfis propostos; ajustar às necessidades reais da empresa (doc 23 Q9).

## 3. Módulos funcionais

### M1 — Website público (bilingue pt-PT/EN)
- Páginas: Início, Sobre Nós, Serviços (catálogo + página por serviço), Formação (catálogo de cursos + página por curso), Notícias e Recursos, Contactos.
- Header profissional com comutador de idioma; footer completo.
- Homepage: hero visualmente marcante, serviços em destaque, formação em destaque, institucional, processo de trabalho, FAQ (quando confirmada), CTAs, contactos.
- Formulários com validação client+server (contacto, pedido por serviço).
- SEO: titles/descriptions únicos por página e idioma, sitemap, robots, canonical, hreflang, Open Graph, JSON-LD (Organization, Service, Course, FAQPage), breadcrumbs.
- PWA instalável com convite não intrusivo (botão discreto + "saber mais"; nunca pop-up imediato; lembrar preferência).

### M2 — Sobre Nós
- Conteúdo institucional confirmado (história, missão, valores — só o que existir de verdade).
- Liderança (CEO Mauro Torres Gonçalves, com foto e bio reais).
- Sem biografias/equipa inventada.

### M3 — Serviços + CRM básico
- Catálogo de serviços com página própria: descrição, benefícios, público-alvo, processo, FAQ do serviço, formulário de solicitação, CTA.
- **CRM**: clientes, empresas, contacts, pedidos de serviço/orçamento, estados (Novo → Em análise → Contactado → A aguardar cliente → Proposta enviada → Em negociação → Convertido/Recusado/Arquivado), responsável interno, observações, histórico, documentos, datas de acompanhamento.
- Protecção anti-spam (honeypot + rate limit; CAPTCHA só se necessário).

### M4 — Formação: catálogo e inscrições (módulo prioritário)
- Catálogo com pesquisa, filtros (categoria/nível/modalidade), página por curso: objectivos, programação, requisitos, duração, modalidade, datas, localização, preço, vagas, formadores (se confirmados), botão de inscrição.
- Curso sem preço/data mostra estado honesto ("a definir"), nunca informação falsa.
- **Fluxo de inscrição**: escolha do curso → formulário (só dados necessários, com finalidade documentada) → registo com número de inscrição único + histórico de estados → upload de comprovativo (validado por magic bytes, tamanho, armazenamento privado) → avaliação administrativa (aprovar/rejeitar/pedir correcção, com nota interna e auditoria) → email ao formando → geração de **confirmação de inscrição** (documento CTS com código de verificação) → verificação de entrada (pesquisa por número/QR, registo de presenças).
- Estados distintos: comprovativo recebido ≠ pagamento validado ≠ inscrição aprovada ≠ recibo emitido.
- **Controlo de vagas transaccional** (duas submissões simultâneas nunca ultrapassam o limite).
- Gestão de turmas/edições e histórico de inscrições antigas.

### M5 — Pagamentos
- Validação **manual** por administrador autorizado (nenhum pagamento é "confirmado" por upload de imagem).
- Lista/filtros/pesquisa de pagamentos, associação a inscrições, decisão com motivo, histórico, relatórios e exportação controlada.
- Sem guardar dados completos de cartões. Integração com fornecedor angolano (Multicaixa Express/EMIS etc.) **apenas se a empresa escolher** (doc 23 Q4) — não inventada.

### M6 — Gestão de conteúdos (CMS)
- Páginas/secções/blocos reutilizáveis; serviços, cursos, categorias, notícias/artigos, FAQs, testemunhos autorizados, equipa, menus, rodapé, redes sociais, metadados SEO, definições do site.
- CRUD completo com publicar/despublicar/arquivar/restaurar/eliminar protegido, **pré-visualização antes de publicar**, confirmação em operações destrutivas, registo de alterações (versionamento) para conteúdos importantes.
- **Biblioteca multimédia**: upload (validação server-side real), pesquisa, substituição, texto alternativo, limpeza de não utilizados, limites de tipo/tamanho visíveis.
- Edição bilingue: cada campo traduzível tem versões pt-PT e EN com indicador de omissão.

### M7 — Utilizadores, RBAC e auditoria
- Sessões seguras, expiração, revogação; recuperação de palavra-passe por email; rate limit no login; **MFA TOTP obrigatório para administradores**; políticas de palavra-passe.
- Permissões verificadas **sempre no servidor** (esconder botões não conta).
- AuditLogs em operações críticas: permissões, criação de admins, aprovações, validações financeiras, alterações de configuração, eliminações.

### M8 — Funcionários
- Registo de funcionários (nome, contactos, departamento, cargo, estado, conta, permissões). Sem dados sensíveis sem justificação.

### M9 — Chatbot
- Responde sobre empresa, serviços, cursos, requisitos, datas/preços publicados, contactos e FAQs, **exclusivamente com base em informação autorizada** (conteúdos da própria plataforma).
- Bilingue (detecta idioma da conversa). Reconhece quando não sabe e encaminha para contacto oficial.
- Sem acesso directo ilimitado à BD: ferramentas limitadas pelo servidor; sem revelar dados pessoais de terceiros; sem operações administrativas.
- Defesas: rate limit, sanitização de input, instrução de sistema resistente a prompt injection, chave de IA só server-side.
- Área administrativa de conversas (lista, pesquisa, filtros, perguntas sem resposta, exportação autorizada) e política de conservação comunicada ao utilizador.

### M10 — Analytics
- Eventos próprios (páginas, origem, dispositivo, cliques em CTA, início e conclusão de inscrição, pedidos de serviço) com minimização de dados (sem IP completo, sem cookies de terceiros sem consentimento).
- Dashboard com dados **reais** e estados vazios honestos ("medição ainda não configurada" quando aplicável).

### M11 — Notificações por email
- Templates CTS (identidade visual) para: inscrição submetida, comprovativo recebido, pedido de correcção, pagamento aprovado/rejeitado, inscrição aprovada/rejeitada, novo pedido de serviço, mensagem de contacto, recuperação de palavra-passe, lembrete de formação (quando configurado).
- Fila com retries e idempotência (sem duplicados); envio no idioma preferido do destinatário.

### M12 — Integração AngoAPI
- Adaptador isolado com feature flag `ANGOAPI_ENABLED` (desligada por omissão — doc 03). Nenhuma funcionalidade depende dela.

## 4. Requisitos não funcionais

| Área | Requisito |
|---|---|
| Idioma | pt-PT (default) e EN em todo o público; hreflang; fallback pt-PT |
| Desempenho | Metas: LCP < 2,5 s, INP < 200 ms, CLS < 0,1 em 4G; imagens WebP/AVIF; fontes self-hosted |
| Segurança | OWASP: validação server-side, ORM parametrizado, CSP, rate limit, uploads validados, cookies seguros, segredos só em env, erros sanitizados |
| Privacidade | Minimização de dados, conservação documentada, acesso restrito, sem expor comprovativos a terceiros |
| Acessibilidade | Navegação por teclado, foco visível, contraste AA, `prefers-reduced-motion`, labels correctos |
| Disponibilidade | Backups diários testados, health check, rollback definido |
| Manutenção | Lint+format (Biome), testes, CI a correr lint/testes/build/auditoria antes de merge |

## 5. Fora de âmbito (fase inicial)

- App móvel nativa (avaliada como fase futura separada, justificar custos).
- Portal de formando completo com e-learning/vídeo-aulas.
- Assinatura digital de contratos.
- Gestão completa de RH (apenas registo básico).
- Multi-empresa/multi-tenant.

## 6. Critérios de aceitação por módulo

Os critérios detalhados por módulo (incluindo os 5 fluxos E2E: inscrição, serviço, conteúdo, chatbot, autorização) estão em `docs/22-acceptance-criteria.md` (a criar na Fase 2). Critérios de aceitação da **Fase de Fundação Técnica**: ver doc 21, §Fase 3.
