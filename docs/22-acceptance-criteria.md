# 22 — Critérios de Aceitação

> **Fase 2 — 2026-10-26** · Módulos M1–M12 (doc 05 §3) + 5 fluxos E2E (doc 21) + orçamentos de desempenho/acessibilidade + critérios da Fase 3 (doc 21 §Fase 3).
> Formato **Given/When/Then**. Nenhum critério pressupõe conteúdo não confirmado (docs 01/02/23).

## 1. Critérios por módulo

### M1 — Website público bilingue
- **G** visitante em `/pt/servicos` **W** clica em EN **T** URL vira `/en/services` com o mesmo scroll/contexto, conteúdo todo em inglês e `hreflang` recíproco presente.
- **G** locale sem tradução **W** abrir a página **T** mostra o pt-PT (fallback), sem mistura de idiomas dentro do mesmo bloco traduzido.
- **G** rota inexistente **W** aceder **T** 404 do locale com links de navegação; `/` redirecciona 308 para `/pt/` (ou `/en` na 1.ª visita EN).
- **G** páginas públicas **W** inspecionar SEO **T** title/description únicos por locale, canonical, OG, JSON-LD (Organization/Service/Course/FAQPage), sitemap e robots existem.

### M2 — Sobre Nós
- **G** conteúdo confirmado (doc 02 §4) **W** abrir `/pt/sobre` **T** aparecem missão, fundação 2016, CEO Mauro Torres Gonçalves com foto/bio reais e secção ANPG; **sem** biografias ou equipa inventada.

### M3 — Serviços + CRM
- **G** serviço publicado **W** abrir `/[locale]/servicos/[slug]` **T** descrição, benefícios, processo e formulário funcionam; despublicar torna a URL 404 com redirect da lista.
- **G** visitante submete pedido de serviço **W** enviar formulário válido **T** cria `ServiceRequest(status=NEW)` persistente + email ao admin + confirmação ao autor (se e-mail presente).
- **G** pedido criado **W** admin percorre o funil (Novo → … → Convertido/Recusado/Arquivado) **T** cada transição fica em `ServiceRequestHistory` com actor e nota.
- **G** bot/honeypot **W** submeter **T** aceite silenciosamente sem persistir; ≥6.º pedido na hora → `429`.

### M4 — Formação e inscrições (prioritário)
- **G** catálogo **W** pesquisar/filtrar por categoria, nível e modalidade **T** resultados paginados; curso sem preço/data mostra "a definir" (nunca dado falso).
- **G** turma com `seatsLimit=20` **W** 20 submissões aceites + 1 **T** a 21.ª é rejeitada/`WAITING_LIST`; contador `seatsHeld` ≤ 20 sempre (teste de concorrência).
- **G** inscrição submetida **W** concluir o formulário **T** devolve número único `INS-AAAA-NNNNNN`, estado `SUBMITTED`/`PROOF_RECEIVED`, histórico iniciado e email ao formando.
- **G** comprovativo enviado **W** upload **T** validado por magic bytes (PDF/JPG/PNG/WEBP) e ≤10 MB, guardado em bucket privado (sem URL pública).
- **G** admin valida **W** aprovar / rejeitar / pedir correcção com nota **T** estados distintos registados (prova ≠ pagamento validado ≠ aprovação ≠ recibo), tudo em `EnrollmentStatusHistory` + `AuditLog`, email enviado no locale do formando.
- **G** inscrição aprovada **W** emitir confirmação **T** PDF com código de verificação único; pesquisa por número/QR no admin devolve o formando; presenças registáveis por data.

### M5 — Pagamentos
- **G** fase 1 **W** olhar para o módulo **T** **nenhum** pagamento é aprovado automaticamente pelo upload; decisão é sempre humana, com motivo, actor e data.
- **G** lista de pagamentos **W** filtrar/pesquisar por estado, curso e data **T** resultados correctos e exportação limitada a perfis com `payments.read`.

### M6 — CMS
- **G** admin cria página **W** pré-visualiza **T** draft visível só por link assinado/preview; publicar torna-a visível publicamente; despublicar/arquivar/restaurar funcionam com confirmação.
- **G** conteúdo bilingue **W** editar só o PT **T** o admin mostra indicador "EN em falta" e o site público serve pt-PT em `/en/...` até haver tradução.
- **G** media **W** upload inválido (extensão certa, conteúdo errado) **T** `415` com mensagem clara; biblioteca mostra limites, alt editável e limpeza de não utilizados.

### M7 — Utilizadores, RBAC, auditoria
- **G** admin sem MFA **W** tentar login **T** é obrigado a enrolar TOTP antes de aceder; login com TOTP errado → `401` após 5 tentativas com lockout.
- **G** sessão activa **W** superadmin revoga **T** o request seguinte do utilizador → `401` (testes T8/T10 da doc 10).
- **G** operação crítica (permissões, aprovação, decisão financeira, configuração, eliminação) **W** executada **T** `AuditLog` imutável com actor, antes/depois e `requestId`.
- **G** recuperação de password **W** pedir e redefinir **T** token single-use de 1 h, todas as sessões terminam, resposta nunca revela se o e-mail existe.

### M8 — Funcionários
- **G** superadmin regista funcionário **W** guardar **T** nome, contactos, departamento, cargo e estado persistem com conta/permissões opcionais; **sem** campos sensíveis sem justificação.

### M9 — Chatbot
- **G** visitante pergunta sobre serviço publicado **W** enviar **T** resposta baseada em conteúdo autorizado, no idioma da conversa, com encaminhamento oficial se não souber.
- **G** pergunta por dados pessoais/inscrições **W** enviar **T** recusa explícita, sem consulta a tabelas privadas (teste T9) e sem expor a instrução de sistema.
- **G** conversa **W** admin abre `/admin/chat` **T** lista/pesquisa/filtros, "perguntas sem resposta" e exportação auditada; política de retenção comunicada na UI.

### M10 — Analytics
- **G** eventos próprios **W** navegar e submeter fluxos **T** página, origem, dispositivo, CTAs e início/conclusão de inscrição registados **sem IP completo e sem cookies de terceiros**.
- **G** sem dados **W** abrir o dashboard **T** estados vazios honestos ("medição ainda não configurada"), nunca números inventados.

### M11 — Notificações
- **G** evento com email **W** ocorrer **T** fila `NotificationQueue` com idempotência (1 email por evento+registo), retries com backoff e envio no locale preferido; templates com identidade CTS.

### M12 — AngoAPI
- **G** flag `ANGOAPI_ENABLED=false` (omissão) **W** correr a plataforma **T** nenhum request é emitido, nenhum módulo depende da integração; `IntegrationSyncLogs` vazio.

## 2. Fluxos E2E (Playwright)

### Fluxo A — Inscrição em curso (10 passos)
1. **G** catálogo `/pt/formacao` **W** pesquisar/filtrar **T** curso certo aparece com estado honesto de preço/vagas.
2. **G** na página do curso **W** escolher turma `OPEN` **T** botão de inscrição activo com número de vagas visível.
3. **G** formulário **W** submeter vazio **T** erros por campo com `aria-invalid` e foco no 1.º inválido.
4. **G** dados válidos + comprovativo **W** submeter **T** 201 com número de inscrição e confirmação visível na tela.
5. **G** submissão **W** verificar BD/email **T** `Enrollment(SUBMITTED|PROOF_RECEIVED)` + histórico + email recebido.
6. **G** admin **W** abre a inscrição **T** vê dados, documento privado (URL assinado) e histrico.
7. **G** admin **W** "pedir correcção" com nota **T** estado `AWAITING_CORRECTION` + email; formando envia nova prova.
8. **G** admin **W** aprovar **T** `PAYMENT_VALIDATED` → `APPROVED`, `seatHeld=true`, `seatsHeld` +1 na transacção.
9. **G** aprovado **W** emitir confirmação **T** PDF com código único; o formando vê tudo no portal (só as **suas** inscrições).
10. **G** dia de formação **W** pesquisa por número/QR **T** formando encontrado e presença registada.

### Fluxo B — Pedido de serviço
**G** `/pt/servicos/[slug]` **W** submeter o formulário **T** `ServiceRequest(NEW)` persiste + emails. **G** admin **W** atribui responsável e move o funil até `CONVERTED` **T** histórico completo com datas/notas; estados inválidos dão `422`.

### Fluxo C — Conteúdo
**G** admin cria página **W** pré-visualiza e publica em PT **T** fica visível em `/pt/…` com SEO correcto; **W** traduz e publica EN **T** visível em `/en/…` com hreflang; **W** despublica **T** URL deixa de servir conteúdo e o sitemap é actualizado.

### Fluxo D — Chatbot
**G** visitante pergunta em PT **W** envia **T** resposta do conteúdo publicado; **W** muda para EN **T** responde em EN; **W** pede dados privados **T** recusa + encaminha; **W** admin abre o chat **T** conversa consultável.

### Fluxo E — Autorização
**G** utilizador STAFF e formando **W** chamam endpoints admin (e respectivas UI) **T** 401/403 conforme a matriz; **G** signed URL expirado/alterado **W** usado **T** 403; **G** sessão revogada **W** request seguinte **T** 401. Corresponde aos 10 testes T1–T10 (doc 10 §2).

## 3. Orçamentos de desempenho (em 4G, field/lab medido)

| Métrica | Orçamento | Verificação |
|---|---|---|
| **LCP** | < 2,5 s | Lighthouse + Web Vitals |
| **INP** | < 200 ms | Lighthouse + testes E2E |
| **CLS** | < 0,1 | Lighthouse (`next/font`, dims de imagem) |
| JS no cliente (home) | ≤ 170 KB gzip | build report |
| Imagens | AVIF/WebP, hero `preload`, sem foto 2,1 MB original | inspecção |
| Fontes | self-hosted (`next/font`), 0 pedidos a CDNs | rede |
| Lighthouse | ≥ 90 em Performance/SEO/A11y (Fase 5) | CI manual por release |

## 4. Critérios de acessibilidade (WCAG 2.2 AA)

1. Contraste AA (4,5:1 / 3:1 grandes) em todos os pares de texto-fundo de ambos os locales — teste automatizado.
2. Fluxo completo só com teclado: skip-link, menu mobile, dropdowns, diálogos (Esc+foco), formulários, tabela do admin.
3. `focus-visible` sempre presente; labels e `aria-describedby`/`aria-invalid` correctos em todos os formulários.
4. `prefers-reduced-motion` desactiva parallax/entradas; 1 `h1`/página; `lang` por locale; alvos ≥ 44 px; zoom 200 % sem perda.

## 5. Critérios da Fase de Fundação Técnica (Fase 3 — doc 21 §Fase 3)

1. `npm install && npm run dev` sobe o site em pt-PT **e** EN e o comutador de idioma funciona.
2. Login/logout/MFA funcionam; sessão expira; revogação possível.
3. Utilizador sem permissão recebe **403** numa acção protegida (teste E2E).
4. CI verde (install → lint → test → build → `npm audit` → scan de segredos); **nenhum** segredo no repositório (gitleaks limpo).
5. `.env.example` completo e README de instalação local validado por terceiro.

**Critério da Fase 2 (esta documentação)**: docs 06, 07, 08, 09, 10 e 22 revistas; diagramas Mermaid coerentes; zero perguntas críticas em aberto para iniciar a Fase 3 (doc 21 §Fase 2).
