# Spec — Sub-projecto A: Wizard de inscrição, documentos, OCR e comprovativo

Data: 2026-12-06
Estado: **em revisão pelo utilizador**
Âmbito: CTS Academia — módulo de formandos (Fases 3-5 do roadmap)

---

## 1. Contexto e objectivo

A plataforma permite hoje criar uma conta e inscrever-se num curso (`src/actions/registration.ts:47-140`, `:146-187`), mas a inscrição nasce em `PENDING` e não há forma de recolher identidade, documentos nem comprovativo.

Objectivo: transformar o fluxo existente num **wizard de inscrição por etapas**, com guardado progressivo, carregamento de documentos, OCR consultivo com comparação, e envio de comprovativo de pagamento — **sem** substituir o registo, a autenticação, o MFA nem o CRUD admin que já funcionam.

## 2. Estado actual (auditoria Fase 1)

Factos verificados no código, não suposições:

| Necessário para o A | Estado | Referência |
|---|---|---|
| Registo de conta + auto-login | existe | `src/actions/registration.ts:47-140` |
| Inscrição (`Enrollment` PENDING) | existe | `prisma/schema.prisma:159-177`, `src/actions/registration.ts:146-187` |
| Auth + TOTP + RBAC | existe | `src/lib/auth.ts:17-78`, `src/lib/totp.ts`, `prisma/schema.prisma:51-58` |
| Auditoria | existe | `src/lib/audit.ts:17-33` (9 pontos de escrita) |
| Dados pessoais (NIF/BI/nascimento/morada/telefone) | **não existe** | `User` só tem `email,name,locale` (`schema.prisma:30-49`) |
| Upload de ficheiros | **não existe** | 0 `type="file"` / multipart em `src/` |
| Storage / URLs assinadas | **não existe** | sem `@supabase/*` no `package.json:25-37` |
| OCR | **não existe** | grep `ocr\|tesseract` = 0 |
| Pagamentos / comprovativos | **não existe** | placeholder `src/app/[locale]/admin/(protected)/[...path]/page.tsx:14` |
| Histórico de estados | **não existe** | auditoria guarda só nomes de campos `src/actions/admin/content.ts:102-108` |
| Migrações Prisma / RLS | **não existe** | `prisma/migrations/` e `*.sql` = 0 |
| Wizard / multi-step | **não existe** | grep `wizard\|onboarding\|currentStep` = 0 |

### 2.1 AngoAPI — análise (pedido explícito do utilizador)

Repositório `Masukulmiguel/angoapi` (Laravel). Lido `routes/api.php` e controllers:

- `POST /api/gateway/identity/verify` → **devolve dados fixos de demonstração** (`'Cidadão Demo'`, datas fixas, `environment: sandbox`) em `app/Http/Controllers/Api/V1/Gateway/IdentityController.php`. **Não consulta nenhum registo oficial.**
- `POST /api/gateway/nif/validate` → devolve `'Empresa Demo Lda.'` fixo (mesma natureza).
- `POST /api/v1/sandbox/validate/bi|nif` → rotas explicitamente `sandbox`.
- `POST /api/gateway/qr/generate` → gerador pseudoaleatório (`crc32($data.$row.$col)`), **não é um encoder QR válido**.
- `GET /api/gateway/location/provinces|municipalities` → **listas estáticas reais** (19 províncias; municípios parciais). Reutilizáveis.

**Conclusão:** não existe API oficial autorizada para consulta de identidade. O preenchimento automático a partir de fonte oficial **não é automatizável hoje** e fica documentado como tal. A via é OCR consultivo + validação humana.

## 3. Fora de âmbito (neste sub-projecto)

- Aprovação automática de identidade ou de pagamento.
- Reconhecimento facial.
- Integração com AGT, INEFOP, bancos, Express ou qualquer gateway de pagamento real.
- Recibos PDF, QR de verificação, mensagens, notificações push, estágios, presenças, certificados (sub-projectos D/E).
- Envio de e-mail (não existe transporte no projecto).
- Alterações ao fluxo de registo, login, MFA ou ao CRUD admin genérico (excepto as 2 correcções de segurança do ponto 8).

## 4. Modelo de dados

Prisma é a fonte de verdade (não existem migrações SQL no repositório). Tabelas novas, sem duplicar as existentes:

### 4.1 `StudentProfile` (novo, 1:1 `User`)
`userId` unique FK → `User`. Campos: `nif?`, `biNumber?`, `birthDate?`, `address?`, `municipality?`, `province?`, `phone?`, `primaryDocumentType` (`NIF|BI` — indica qual dos números o formando usou como referência principal; **não** decide quais documentos enviar), `updatedAt`.

**Regra de documentos (fechada para evitar ambiguidade):** `nif` e `biNumber` são campos independentes e ambos podem existir. A **Etapa 2 exige sempre a frente e o verso do BI**, seja qual for o `primaryDocumentType` — o BI é o documento de identidade do formando; o NIF é um campo adicional de identificação fiscal. Ninguém fica sem Etapa 2.

**Porquê tabela separada:** separa dados pessoais sensíveis de conta de autenticação (Regra 10 do prompt). `User` não ganha colunas de identidade.

### 4.2 `EnrollmentDocument` (novo, N:1 `Enrollment`)
`id`, `enrollmentId` FK, `kind` enum `BI_FRONT|BI_BACK|PHOTO|PROOF`, `storageKey` (privado, nunca URL público), `mimeType`, `byteSize`, `sha256`, `ocrStatus` enum `NOT_RUN|RUNNING|DONE|FAILED`, `ocrRaw` Json?, `ocrConfidence` Float?, `reviewStatus` enum `PENDING|MATCHED|DIVERGENT|NOT_READABLE|APPROVED|REJECTED`, `reviewedBy?` FK `User`, `rejectionReason?`, `createdAt`, `updatedAt`.
`@@unique([enrollmentId, kind])` — um ficheiro por tipo por inscrição (substituir = update).
Índice: `@@index([enrollmentId])`.

### 4.3 `PaymentSubmission` (novo, 1:1 `Enrollment`)
`id`, `enrollmentId` unique FK, `method` enum `EXPRESS|BANK_TRANSFER`, `amount` (decimal guardado como `Decimal(12,2)`), `currency` default `AOA`, `reference?`, `ocrExtract` Json?, `ocrStatus`, `duplicateCheckHash?` (unique), `reviewStatus` enum `PENDING|MATCHED|DIVERGENT|APPROVED|REJECTED`, `reviewedBy?`, `rejectionReason?`, `createdAt`, `updatedAt`.

**Anti-duplicação:** `duplicateCheckHash = sha256(normalizedReference | amount | paymentDate)`. Unique em `duplicateCheckHash` (quando não nulo) → o servidor rejeita reutilização de comprovativo noutro processo e devolve "comprovativo já utilizado".

### 4.4 `EnrollmentStatusHistory` (novo, N:1 `Enrollment`)
`id`, `enrollmentId` FK, `fromStatus?`, `toStatus`, `actorUserId?` FK `User`, `actorRole?`, `reason?`, `createdAt`.
Índices: `@@index([enrollmentId, createdAt])`.

### 4.5 `Setting` (novo)
`key` unique, `value` Json, `updatedBy?`, `updatedAt`. Chaves necessária neste A: `payment.instructions` (texto oficial), `payment.bank` (IBAN/titular configurados pelo admin — **nunca** no frontend), `payment.express` (instruções Express).
Sem `Setting`, o passo 4 não pode renderizar dados de pagamento autorizados → bloqueia o sub-projecto.

### 4.6 Alterações a `Enrollment` existente
- Acrescentar `currentStep Int @default(1)` e `submittedAt DateTime?`.
- Alargar o enum `EnrollmentStatus`.

**Enum proposto (9 estados do prompt):**
`DRAFT | PENDING_DOCUMENTS | SUBMITTED | UNDER_REVIEW | CORRECTION_REQUIRED | PAYMENT_PENDING_VERIFICATION | APPROVED | REJECTED | CANCELLED`

**Enum actual:** `PENDING | PAID | CONFIRMED | COMPLETED | CANCELLED` (`prisma/schema.prisma:179-185`).

**Migração de dados (obrigatória, preserva linhas existentes):**

| Actual | Novo |
|---|---|
| `PENDING` | `PAYMENT_PENDING_VERIFICATION` |
| `PAID` | `PAYMENT_PENDING_VERIFICATION` |
| `CONFIRMED` | `APPROVED` |
| `COMPLETED` | `APPROVED` |
| `CANCELLED` | `CANCELLED` |

Aplicada em transacção, em 2 passos (add coluna temporária → backfill → drop antiga) para não perder registos. O seed (`prisma/seed.ts:190-199`) e o admin passam a usar os valores novos. Rótulos PT/EN actualizados em `src/app/[locale]/aluno/page.tsx:12-18`, `src/lib/admin/resources.ts:206`, `src/app/[locale]/admin/(protected)/[resource]/page.tsx:29-39`.

### 4.7 Restrições e índices adicionais
- FKs com `onDelete: Restrict` para documentos/pagamentos (não apagar inscrição com documentos sem limpeza explícita de storage).
- `EnrollmentDocument.storageKey` unique.
- Índices em `Enrollment(status)`, `Enrollment(userId)` (já existem: `schema.prisma:175-176`).

## 5. Máquina de estados

Ficheiro único: `src/lib/enrollment-state.ts`.

```ts
type Transition = { from: EnrollmentStatus; to: EnrollmentStatus; roles: UserRole[]; requires?: ('documents'|'payment')[] }
```

Transições permitidas:

| De | Para | Papéis | Exige |
|---|---|---|---|
| `DRAFT` | `PENDING_DOCUMENTS` | STUDENT | — |
| `PENDING_DOCUMENTS` | `SUBMITTED` | STUDENT | 4 documentos + perfil completo |
| `SUBMITTED` | `UNDER_REVIEW` | ADMIN, SUPER_ADMIN, SUPPORT | — |
| `UNDER_REVIEW` | `CORRECTION_REQUIRED` | ADMIN, SUPER_ADMIN, SUPPORT | `reason` |
| `CORRECTION_REQUIRED` | `PENDING_DOCUMENTS` | STUDENT | — |
| `UNDER_REVIEW` | `PAYMENT_PENDING_VERIFICATION` | ADMIN, SUPER_ADMIN, SUPPORT | docs aprovados |
| `PAYMENT_PENDING_VERIFICATION` | `APPROVED` | ADMIN, SUPER_ADMIN | pagamentos aprovados |
| `SUBMITTED` / `UNDER_REVIEW` / `PAYMENT_PENDING_VERIFICATION` | `REJECTED` | ADMIN, SUPER_ADMIN | `reason` |
| qualquer | `CANCELLED` | STUDENT (dono) ou ADMIN | `reason` |

Regras imutáveis no código:
- **`APPROVED` só é alcançável se todos os documentos tiverem `reviewStatus = APPROVED` e o `PaymentSubmission` também.** Verificação no servidor, não no UI.
- O frontend **nunca** envia `to`. Só envia a *intenção* (`submitStep`, `requestCorrection`, …); o servidor escolhe o destino.
- `transitionEnrollment(db, {enrollmentId, to, actorUserId, reason})` é o **único** ponto de escrita de estado; grava `EnrollmentStatusHistory` + `AuditLog` na mesma transacção.
- Toda a lista de transições tem teste unitário a cobrir cada par.

## 6. Wizard — rotas e etapas

Rotas (App Router, PT + EN):
```
/{locale}/aluno/inscricao/[enrollmentId]            → redirect para etapa actual
/{locale}/aluno/inscricao/[enrollmentId]/etapa/[n]  → n ∈ 1..5
```

Layout: `Stepper` (5 passos, mostra actual, restantes e concluídos), `Progressbar`, estado guardado lido de `Enrollment.currentStep`.

Cada etapa = componente de cliente + **server action própria** (`src/actions/enrollment-wizard/step1..5.ts`). O servidor valida com Zod, grava e devolve `{ ok, errors?, nextStep }`. Sair e voltar **não perde dados** porque tudo está na BD.

**Guardas:** o dono da sessão tem de ser `enrollment.userId`, senão `notFound()`. Etapa `n` só é acessível se `currentStep >= n` (excepto quando `CORRECTION_REQUIRED` abre apenas os campos pedidos).

### Etapa 1 — Identificação e dados pessoais
Título: **"Vamos confirmar a sua identidade."**
Explicação: *"Introduza o seu NIF ou número do Bilhete de Identidade para preencher os seus dados pessoais e iniciar a validação da inscrição."*

Campos: `primaryDocumentType` (NIF|BI) + o número correspondente (`nif` e/ou `biNumber`), nome completo, data de nascimento, morada, município, província, telefone, e-mail (pré-preenchido e editável).

- Províncias/municípios: **importados** das listas reais da AngoAPI (ponto 2.2) para um ficheiro estático `src/content/angola-locations.ts`, com sincronização documentada. Não há rede em runtime.
- **Preenchimento automático:** desactivado por defeito. Só é activável se existir `ANGOAPI_IDENTITY_URL`+chave **e** a resposta não for `environment === 'sandbox'`. Como hoje só existe sandbox, o botão "Preencher automaticamente" **não é renderizado** — em vez disso é oferecido **OCR do documento na Etapa 2** (ver §7), que preenche campos como *proposta para confirmação*.
- Antes de avançar: **ecrã de resumo** com todos os campos para confirmação explícita do formando.
- Dados do OCR aparecem marcados como **"dados sujeitos a validação documental"**.

### Etapa 2 — Documento de identificação
Título: **"Carregue o seu Bilhete de Identidade."**
Duas áreas obrigatórias e independentes: **frente** e **verso**.

Por área: captura com câmara (`<input capture="environment">`), escolha da galeria, visualização prévia, substituição, recorte/ajuste (`react-easy-crop`).

Após upload corre o OCR e é apresentada a **tabela de comparação**:

| Campo | Dados da inscrição | Dados extraídos | Resultado |
|---|---|---|---|
| Nome | … | … | Correspondência / Divergência / Não foi possível identificar |

- Divergência → aviso + opções: **corrigir os dados** (volta à Etapa 1 só nos campos indicados) ou **reenviar o documento**.
- Copy obrigatório no ecrã: *"A leitura automática é uma proposta de preenchimento. Não confirma a autenticidade do documento. A validação é feita por um funcionário autorizado."*
- **Nunca** muda estado para aprovado por causa do OCR.

### Etapa 3 — Fotografia do formando
Título: **"Precisamos de uma fotografia sua."**
Captura/importação/visualização/substituição, com recorte.

Orientações visíveis: rosto visível, boa iluminação, frontal, sem filtros, sem óculos escuros, fundo simples.
Justificação mostrada: *"Será usada para identificação administrativa, organização da turma, controlo de presenças e confirmação da identidade no dia da formação."*
**Sem** reconhecimento facial. A semelhança com o BI fica para revisão humana.

### Etapa 4 — Pagamento e comprovativo
Título: **"Confirme o pagamento da sua formação."**

Dados do curso **lidos da BD**, nunca do frontend: nome, nível, `Course.price`, descrição (`prisma/schema.prisma:99-121`).
Dados de pagamento lidos de `Setting` (`payment.bank`, `payment.express`, `payment.instructions`). Se `Setting` não existir → o admin é notificado e a etapa mostra "dados de pagamento em configuração" **sem inventar IBAN**.

Métodos: **A — Express** / **B — Transferência bancária** (dois cartões seleccionáveis).

Comprovativo: fotografia, galeria, PDF (quando o tipo for `application/pdf`), visualização, substituição.

OCR do comprovativo extrai: valor pago, data, referência, destinatário, nº de transacção, método. Depois:
- Compara `amount` extraído com `Course.price` → **"Valor correspondente"** ou aviso *"Valor divergente — encaminhado para análise administrativa"*.
- Calcula `duplicateCheckHash` e submete; colisão → erro "comprovativo já utilizado noutra inscrição".
- Copy obrigatório: *"A leitura automática não confirma que o pagamento foi recebido. O pagamento só é confirmado por um funcionário responsável."*

### Etapa 5 — Revisão e submissão
Lista: dados pessoais, documento de identificação, fotografia, curso, nível, valor, método, comprovativo.
Checkbox de aceitação dos termos de tratamento de dados (obrigatório).
Botão: **"Submeter inscrição para validação."**
Ação: `DRAFT/PENDING_DOCUMENTS → SUBMITTED`, `submittedAt = now()`, bloqueio de edição dos documentos submetidos (excepto pedido de correcção do admin), `currentStep` congela.

## 7. OCR — implementação

- **Motor:** `tesseract.js`, idiomas `por+eng`.
- **Onde corre:** no **cliente**, após selecção da imagem, antes/paralelamente ao upload. Só o texto extraído + score vai ao servidor. Justificação: sem limite de memória no Vercel, imagem não sai do dispositivo para nenhum terceiro, e o OCR é consultivo.
- **Resultado guardado** em `EnrollmentDocument.ocrRaw` com `{ source: 'client', engine: 'tesseract.js', lang, confidence, raw }`. `source` fica explícito para nunca ser confundido com verificação oficial.
- **Comparação:** `src/lib/ocr/compare.ts`, função pura e unit-testada:
  - normalização: trim, colapso de espaços, minúsculas, remoção de acentos, parse de datas aceitando `dd/mm/aaaa` e `aaaa-mm-dd`, remoção de pontuação em números de documento.
  - devolve por campo: `MATCH | DIFFERENT | UNKNOWN` + valores normalizados.
- Falha/timeout do OCR → `ocrStatus = FAILED` e o formando continua, com a marcação "Não foi possível identificar".

## 8. Armazenamento de ficheiros

- Bucket Supabase **privado** `enrollment-documents`.
- Chave: `{userId}/{enrollmentId}/{kind}` — sem nomes do utilizador, sem NIF no caminho.
- Upload por **server action** com:
  - validação de **magic bytes** (JPEG/PNG/PDF) além da extensão;
  - limite de tamanho (configurável, defeito 8 MB) e de contagem;
  - rate-limit por utilizador (`src/lib/rate-limit.ts` já existe);
  - `sha256` calculado e guardado.
- Leitura: **URL assinada de 10 minutos**, gerada no servidor só depois de `enrollment.userId === session.user.id` (ou papel admin autorizado). Nunca `public/`.
- Remoção: ao substituir ou recusar, apaga o objecto anterior; política de retenção documentada (apagar documentos de inscrições `CANCELLED`/`REJECTED` após N dias, por acção admin, com auditoria).

## 9. Papéis e correcções de segurança (incluídas no A)

1. **`requireAdmin()` passa a ser chamado** em `src/app/[locale]/admin/(protected)/layout.tsx:18-24`. Hoje só `requireUser()` → qualquer `STUDENT` acede ao admin (`src/middleware.ts:16-20` só verifica sessão).
2. **`listRows('enrollments')` deixa de incluir `user` inteiro** — passa a selecionar só `id,name,email` (`src/lib/admin/content-repo.ts:44-47`); hoje expõe `passwordHash`.
3. RBAC adicional no A: leitura de documentos exige dono ou `SUPER_ADMIN|ADMIN|SUPPORT`; `SUPPORT` **não** aprova pagamento.
4. Todas as acções administrativas desta fase escrevem `AuditLog` com `actorUserId`, `action`, `entityType`, `entityId`, `metadata` (sem PII desnecessária).

## 10. Testes

- **Unitários (Vitest):**
  - `enrollment-state.test.ts` — todos os pares de transições, incluindo os bloqueios (`APPROVED` sem docs/pagamento rejeitado; `SUPPORT` a tentar aprovar).
  - `compare.test.ts` — datas, acentos, maiúsculas, números de documento, `UNKNOWN`.
  - `duplicate-hash.test.ts` — mesma referência/valor/data → colisão; variação de um campo → ok.
  - `upload-validation.test.ts` — magic bytes, tamanho, extensão falsa.
  - manter **33 testes existentes verdes** (`vitest run`).
- **E2E (Playwright):** percurso completo etapa 1→5 com upload de imagens falsas, submissão, e verificação de que `APPROVED` não é alcançável pela UI.
- **Comandos obrigatórios por entrega:** `npx biome check src messages`, `npm run typecheck`, `npx vitest run`, `npm run build` (dev server parado).

## 11. Critérios de aceitação

1. Registo, login, MFA e CRUD admin continuam a funcionar (testes existentes verdes).
2. Formando cria conta, escolhe curso, entra no wizard e **pode sair a meio e retomar sem perder dados**.
3. Etapa 1 exige resumo de confirmação antes de avançar.
4. Etapa 2 exige frente **e** verso, mostra tabela de comparação com os 3 resultados possíveis, e nunca aprova sozinha.
5. Etapa 4 lê `Course.price` e `Setting` da BD; não há IBAN/valor fixo no código.
6. Comprovativo com valor divergente é sinalizado e segue para análise; comprovativo repetido é rejeitado.
7. Submissão → `SUBMITTED`; `APPROVED` inalcançável sem validações do servidor.
8. Nenhum ficheiro em bucket público; todas as leituras por URL assinada com verificação de dono.
9. Um `STUDENT` não consegue aceder a `/pt/admin` nem ver documentos de outro formando.
10. Histórico de estados completo e auditado.

## 12. Riscos e decisões abertas

- **Qualidade do OCR em fotos de telemóvel:** mitigado por recorte, boa orientação visual e revisão humana obrigatória. Se a taxa de falha for alta, avaliar API cloud como melhoria futura (custo a decidir pelo utilizador).
- **`react-easy-crop` e `tesseract.js` são dependências novas** — `tesseract.js` descarrega dados de treino (~15 MB) na primeira utilização; considerar cache e spinner com skeleton.
- **Municípios da AngoAPI são parciais** (só 3 províncias com lista completa) → campo aceita texto livre como fallback, com validação de província pela lista oficial.
- **Sem transporte de e-mail** no projecto: as "notificações" da fase A são **in-app** (registadas em BD e mostradas na área do formando). E-mail fica para fase posterior.
- **RLS Supabase:** como a app usa a role do `DATABASE_URL` e não há migrações SQL, a aplicação mantém o controlo de acesso no servidor Prisma nesta fase; activar RLS é trabalho do sub-projecto F (segurança), para não bloquear o A com uma migração de permissões riscada.
