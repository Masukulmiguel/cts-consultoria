# CTS Consultoria — Contas na base de dados, inscrição de formandos, pagamento manual e dashboards reais

Data: 2026-11-05
Estado: para revisão

## 1. Contexto

O projecto já tem autenticação (Auth.js + Credenciais), MFA TOTP, RBAC, auditoria e área do
formando. O que falta, e o que o utilizador exigiu:

1. As contas (admin e restantes utilizadores) têm de viver **na base de dados**, nunca em código.
   Situação actual: `prisma/seed.ts` já lê `BOOTSTRAP_ADMIN_*` / `SEED_STUDENT_*` do ambiente
   (sem credenciais fixas no código) e `.env` nunca foi versionado — a regra está respeitada.
   Mas **a única forma de criar contas é correr o seed por linha de comandos**: o admin não tem
   ecrã de utilizadores e `hashPassword()` (`src/lib/password.ts:5`) não é usado por nada.
2. Um formando que clique no **panfleto de um curso publicado pelo admin** tem de poder
   **criar a sua conta** (ou entrar com a conta que já tem) e **inscrever-se** nesse curso.
3. O **pagamento é manual com comprovativo**: o aluno recebe instruções, submete a referência, o
   admin valida. Não há gateway de pagamento no projecto (nem Stripe, nem Multicaixa).
4. Cada **panfleto** tem de mostrar **descrição no hover**.
5. Os **dashboards** (admin, formando, páginas de funcionários/clientes) têm de mostrar **dados
   reais**. Hoje o dashboard do admin é quase todo mock (`src/lib/admin/dashboard-data.ts`).

## 2. Decisões tomadas com o utilizador

| Tema | Decisão |
| --- | --- |
| Registo de formandos | Público, a partir do panfleto do curso publicado pelo admin |
| Pagamento | Manual com comprovativo (instruções no site + validação pelo admin) |
| Visitas / tráfego | Implementar tracking real (sem números inventados) |
| Panfletos | Passam a vir dos cursos publicados pelo admin, com descrição no hover |
| Cadastro das contas | Sempre na BD (bcrypt, 12 rounds); nunca credenciais em código |

Fora de âmbito (decidido por ser fase posterior): auto-registo com confirmação por e-mail (não há
SMTP configurado), gateway de pagamento online, upload de ficheiro de comprovativo (não há storage
configurado).

## 3. Modelo de dados

### 3.1 Novos models

```prisma
/// Visita ao site, para o dashboard mostrar números reais.
model PageView {
  id        String   @id @default(cuid())
  path      String
  referrer  String?
  ipHash    String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([createdAt])
  @@index([path, createdAt])
}

/// Pagamento submetido pelo formando (pagamento manual com comprovativo).
model Payment {
  id           String        @id @default(cuid())
  enrollmentId String
  enrollment   Enrollment    @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  method       PaymentMethod @default(MULTICAIXA)
  reference    String
  amount       String
  paidAt       DateTime?
  note         String?
  status       PaymentStatus @default(SUBMITTED)
  reviewedById String?
  reviewedAt   DateTime?
  reviewNote   String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([status, createdAt])
  @@index([enrollmentId])
}

enum PaymentMethod { MULTICAIXA TRANSFERENCIA OUTRO }

enum PaymentStatus { SUBMITTED VALIDATED REJECTED }

/// Instruções de pagamento editáveis pelo admin.
model PaymentSetting {
  id               String   @id @default(cuid())
  holder           String
  bank             String
  iban             String
  multicaixaExpress String?
  instructionsPt   String?
  instructionsEn   String?
  updatedAt        DateTime @updatedAt
}
```

`PaymentSetting` tem uma única linha (id fixo `default`). `Enrollment` recebe a relação inversa
`payments Payment[]`.

### 3.2 Migrações

O repositório **não tem** `prisma/migrations/` (o esquema foi aplicado com `db push`). O `vercel.json`
faz `buildCommand: "prisma generate && next build"` — ou seja, o build **não** aplica migrações.
Consequência: cada alteração de esquema exige criar a migração localmente e aplicar
`prisma migrate deploy` contra a base de dados de produção (Supabase, pooled) **antes** do deploy.

## 4. Passo 1 — Panfletos do admin + inscrição com criação de conta

### 4.1 Panfletos lidos da BD

`src/components/views/training-view.tsx`: a constante `FLYERS` (linhas 11-24, lista estática de 12
imagens) é **removida**. A secção "Panfletos oficiais" passa a iterar `getPublicCourses()`
(cursos com `published: true`), usando `imageUrl` como panfleto.

Cada panfleto é um card com:
- imagem (`imageUrl`), overlay escuro no **hover** (desktop) com título, nível, duração, preço e
  descrição (`summary`);
- no mobile (sem hover) a descrição fica sempre visível abaixo da imagem;
- botão **Inscrever-se** → `/{locale}/formacao/{slug}/inscrever`.

`getPublicCourses()` (`src/lib/content-db.ts:68`) passa a devolver também `brochureUrl`.

### 4.2 Página de inscrição

`/{locale}/formacao/[slug]/inscrever` (nova rota, pública):
- cabeçalho com o curso (título, nível, duração, preço, resumo);
- estado **sem sessão**: separador "Criar conta" / "Já tenho conta";
  - "Criar conta": email, nome, palavra-passe, confirmação → `registerStudent`;
  - "Já tenho conta": login (reutiliza `checkCredentials` + `signIn`, como
    `student-login-form.tsx`), com `callbackUrl` a apontar para a própria página de inscrição;
- estado **com sessão**: botão "Confirmar inscrição" → `enrollInCourse`.

### 4.3 Server actions (novas, em `src/actions/`)

- `registerStudent({ email, name, password })`
  - validação Zod: email válido, nome 2-80 chars, palavra-passe mínimo 8 caracteres;
  - normaliza email para minúsculas; `prisma.user.findUnique` → se já existe, devolve
    `email_taken` (não revela se é admin ou formando);
  - `hashPassword()` (bcrypt, 12 rounds) — a senha nunca é guardada em claro nem registada em log;
  - cria `User` com `role: STUDENT`, `locale`, `totpEnabled: false`;
  - `audit({ action: 'user.register', entityType: 'user', entityId: user.id, ip })`;
  - limite de tentativas **persistido na BD**: no máximo 5 registos por `ipHash` e por email nas
    últimas 24 h (contagem em `AuditLog`), para não depender do rate-limit em memória
    (`src/lib/rate-limit.ts` é por instância e não fiável em serverless);
  - devolve `ok` e faz `signIn` no servidor → sessão iniciada;
- `enrollInCourse({ courseId })`
  - exige sessão; curso tem de estar publicado;
  - `upsert` da `Enrollment` com `status: PENDING` (o índice único `[userId, courseId]` evita
    duplicados);
  - `audit({ action: 'enrollment.create', ... })`;
  - redirecciona para `/{locale}/aluno`.

### 4.4 Onde entra o botão nos panfletos já existentes

Os cards "Cursos publicados" (secção já lida da BD) passam a usar o mesmo destino
(`/{locale}/formacao/{slug}/inscrever`) em vez de `/contacto#contacto`.

## 5. Passo 2 — Pagamento manual com comprovativo

### 5.1 Lado do formando

- Na página de inscrição, depois da inscrição criada: bloco "Pagamento" com as instruções vindas de
  `PaymentSetting` (titular, banco, IBAN, referência Multicaixa Express) e o valor do curso
  (`Course.price`);
- formulário: método (Multicaixa Express / Transferência / Outro), referência, valor pago, data,
  nota → `submitPayment`;
- a inscrição fica `PENDING` e o pagamento `SUBMITTED`;
- a área do formando (`/{locale}/aluno`) mostra o estado real: "A aguardar pagamento", o histórico
  de pagamentos e a acção "Submeter comprovativo" enquanto `PENDING`.

### 5.2 Lado do admin

- `/{locale}/admin/pagamentos` (hoje placeholder em `[...path]`) passa a listar pagamentos reais:
 курso, formando, método, referência, valor, estado, data;
- acções "Validar" (→ `Payment: VALIDATED`, `Enrollment: PAID`) e "Rejeitar" (com nota →
  `Payment: REJECTED`, inscrição continua `PENDING`);
- `audit({ action: 'payment.validate' | 'payment.reject', ... })`;
- as instruções de pagamento são editáveis em `/{locale}/admin/configuracoes/pagamento`
  (nova página, escrita directa em `PaymentSetting`).

### 5.3 Estados

`Enrollment`: `PENDING` (inscrito, sem pagamento validado) → `PAID` (comprovativo validado) →
`CONFIRMED` (confirmado pela CTS, via admin) → `COMPLETED` / `CANCELLED`.
O aluno **não** muda o estado da inscrição: só o admin valida.

## 6. Passo 3 — Dashboards com dados reais

### 6.1 Tracking de visitas

- `PageView` é escrito por um route handler público (`POST /api/track`) chamado pelo layout
  público, em `navigator.sendBeacon` no `visibilitychange`/ unload, com `path`, `referrer`,
  `userAgent` e `ipHash` (HMAC-SHA256 do IP com um sal **estável** guardado em
  `ANALYTICS_SALT` — o sal tem de ser estável para contar visitantes únicos no período; o hash
  não é reversível e o IP em claro nunca é guardado).
- A escrita é fire-and-forget e nunca bloqueia o render.

### 6.2 Dashboard do admin (`src/lib/admin/dashboard-data.ts`)

Substituição total dos mocks por agregações reais:

| Card / gráfico | Origem |
| --- | --- |
| Visitas ao Website | `PageView` (últimos 7 dias, série diária real) |
| Origem do tráfego | `PageView.referrer` agregado (Pesquisa/Direto/Redes/Outros) |
| Pedidos de Contacto | `ContactMessage` (total e não lidos) — já era real |
| Visitantes Únicos | `PageView` distintos por `ipHash` no período |
| Inscrições em Cursos | `Enrollment` por estado (gráfico real) |
| Solicitações de Serviços | `Service` publicados + pedidos reais (quando existirem) |
| Feed de atividade | `AuditLog` + `ContactMessage` + `Enrollment` + `Payment` recentes |
| Cursos em destaque | `Course` mais inscritos (`_count.enrollments`), com imagem real |
| Totais | contagens na BD (`users`, `services`, `enrollments`, `payments`, `pageViews`) |

### 6.3 Área do formando

Já lê da BD; passa a mostrar também o estado do pagamento e o comprovativo submetido, e o botão de
submeter/reescrever comprovativo.

### 6.4 Páginas de funcionários, clientes e analytics

- `/{locale}/admin/funcionarios` → lista real de `User` com papel, último login e data de criação;
- `/{locale}/admin/clientes` → `User` com papel `STUDENT` e as suas inscrições;
- `/{locale}/admin/analytics/visitas` → tabela de visitas reais por dia/caminho;
- `/{locale}/admin/chatbot/conversas` → deixa de mostrar números inventados; só passa a listar
  conversas se passarmos a persistir as mensagens do chat (fora de âmbito desta fase: fica
  "sem histórico" com nota explicativa).

## 7. Segurança

- Senhas: nunca em código, nunca em logs; `hashPassword` (bcrypt 12 rounds) já existente.
- Palavras-passe de formando: mínimo 8 caracteres. Staff (admin/funcionário) continuam a usar MFA.
  A área do formando **não** expõe o formulário de activação de MFA nesta fase (o login já aceita
  TOTP quando `totpEnabled`).
- Limite de registos: 5 por IP/24 h e 5 por email (contagem em `AuditLog`), implemented no servidor.
- `audit()` para: `user.register`, `enrollment.create`, `payment.submit`, `payment.validate`,
  `payment.reject`. Nunca registar palavras-passe nem códigos TOTP.
- RBAC: as novas páginas de admin usam `requireRole`/`assertCan` de `src/lib/rbac.ts`.
- O middleware continua a proteger `/admin` (sessão) e o servidor re-valida o papel.
- Rate-limit em memória mantém-se no login; o registo usa o limite persistente descrito acima.

## 8. Deploy

1. `prisma migrate dev --name ...` localmente (cria a migração) — `prisma/migrations/` passa a
   existir e fica versionada.
2. `npx prisma migrate deploy` contra a base de dados de produção (Supabase) antes do deploy da
   aplicação.
3. `npm run build` local (exit 0) → `vercel --prod`.
4. Novas variáveis de ambiente: nenhuma obrigatória. `PaymentSetting` é configurável no admin.
5. Rollback: o `Payment`/`PageView`/`PaymentSetting` são tabelas novas — reverter a aplicação não
   afecta dados existentes.

## 9. Critérios de aceitação

- [ ] O panfleto mostra descrição no hover (desktop) e sempre visível no mobile.
- [ ] O botão "Inscrever-se" leva à página do curso e **cria a conta na BD** (role `STUDENT`,
      hash bcrypt, sem senha em claro em lado nenhum).
- [ ] Um formando com conta existente entra e inscreve-se sem criar conta nova.
- [ ] A inscrição aparece na área do formando com estado real.
- [ ] O formando submete a referência de pagamento; o admin valida e a inscrição passa a `PAID`.
- [ ] O dashboard do admin mostra números reais (0 contacts, 1 inscrição, 11 cursos, visitas reais)
      e nenhum número inventado.
- [ ] A área do formando mostra pagamentos reais.
- [ ] `npx biome check .`, `npm run typecheck`, `npx vitest run` e `npm run build` sem erros.
- [ ] Testes Playwright: registo → inscrição → submissão de pagamento → validação no admin.

## 10. Riscos

| Risco | Mitigação |
| --- | --- |
| Migração não aplicada em produção | Passo explícito `prisma migrate deploy` antes do deploy (secção 8) |
| Spam de registos | Limite persistente por IP/email + auditoria |
| Registo público expõe e-mails existentes | Resposta genérica "email já registado" sem revelar o papel |
| Tracking de visitas sem consentimento | Guardar apenas HMAC do IP (sem PII), caminho e referrer; sem cookies de profiling |
| Número de ficheiros grande | Reutilizar o CRUD genérico do admin (`resources.ts`) sempre que possível |
