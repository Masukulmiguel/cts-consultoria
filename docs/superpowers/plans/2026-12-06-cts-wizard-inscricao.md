# CTS Academia — Sub-projecto A: Wizard de Inscrição, Documentos, OCR e Comprovativo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o fluxo actual de registo+inscrição num wizard de 5 etapas com dados pessoais, documentos de identificação, fotografia, comprovativo de pagamento, OCR consultivo e submissão para validação — sem perder as funcionalidades existentes.

**Architecture:** Prisma continua a ser a fonte de verdade. Acrescentam-se 6 tabelas novas e alarga-se o enum `EnrollmentStatus` (5→9 valores, com backfill que preserva linhas). `transitionEnrollment()` é o único ponto de escrita de estado. Upload para bucket Supabase privado com URLs assinadas; OCR corre no cliente (`tesseract.js`) e só o texto vai ao servidor, marcado como `source: 'client'`.

**Tech Stack:** Next.js 15 App Router, React 19 Server Actions (`useActionState`), Prisma 6 + PostgreSQL (Supabase), next-auth v5, Zod 3, Vitest 3, `@supabase/supabase-js`, `tesseract.js`, `react-easy-crop`, Tailwind 4, Biome.

**Spec:** `docs/superpowers/specs/2026-12-06-cts-wizard-inscricao-design.md`

---

## Global Constraints

- **Nunca fazer deploy.** Sem `vercel --prod`. Sem commit sem autorização explícita do utilizador.
- Não eliminar funcionalidades existentes: registo (`src/actions/registration.ts:47-140`), login, MFA/TOTP, CRUD admin e os 33 testes existentes têm de continuar verdes.
- O frontend **nunca** envia o estado final da inscrição. Só intenções; o servidor escolhe o destino.
- **Nunca** declarar identidade ou pagamento confirmados por OCR. Copy obrigatória no ecrã (ver §Etapa 2 e §Etapa 4).
- Nenhum ficheiro em local público. Nenhum IBAN, valor ou referência de pagamento fixa no código — só via `Setting`.
- Dados de resposta de actions: nunca incluir `passwordHash`, `totpSecretEnc`, `sessionVersion`.
- Comandos de verificação obrigatórios no fim de cada task: `npx biome check src messages`, `npm run typecheck`, `npx vitest run`. Build (`npm run build`) só com dev server parado.
- Idioma do código: PT nos comentários e mensagens de erro visíveis (padrão do projecto). Inglês em identificadores.
- `prisma/seed.ts` e `src/lib/admin/resources.ts` têm de ser actualizados sempre que o enum mudar.

## Review Focus

Cinco condições que a spec implica mas que nenhum teste trivial cobre, e a tarefa que as fixa:

1. **Um formando lê documentos de outro formando** → teste `cria URL assinada apenas para o dono ou admin` na Task 6.
2. **`APPROVED` alcançável sem documentos/pagamento aprovados** → teste `recusa APPROVED quando falta validação` na Task 3.
3. **Comprovativo reutilizado noutro processo** → teste `mesmo hash é rejeitado` na Task 9.
4. **A migração do enum perde ou corrompe linhas existentes** → verificação `contagem de linhas antes/depois` na Task 2 (passo de verificação, não teste unitário).
5. **Uma action devolve `passwordHash`/PII na resposta** → teste `resposta não contém campos sensíveis` na Task 1 e Task 12.

---

### Task 1: Correcções de segurança de acesso

**Files:**
- Modify: `src/app/[locale]/admin/(protected)/layout.tsx:18-24`
- Modify: `src/lib/admin/content-repo.ts:43-47`
- Test: `src/lib/admin/content-repo.test.ts` (criar)

**Interfaces:**
- Consumes: `requireAdmin()` já existe em `src/lib/rbac.ts:45-47` (nunca chamado).
- Produces: `listRows('enrollments')` passa a devolver `user` só com `{id, name, email}`. Nada mais muda de assinatura.

- [ ] **Step 1: Escrever o teste que falha**

Em `src/lib/admin/content-repo.test.ts`, com o padrão `vi.hoisted`/`vi.mock('@/lib/prisma')` de `src/actions/registration.test.ts:3-14`:

```ts
it('não inclui passwordHash ao listar inscrições', async () => {
  await listRows('enrollments');
  const args = prismaMock.enrollment.findMany.mock.calls[0][0];
  expect(args.include).toBeUndefined();
  expect(args.select).toMatchObject({
    id: true,
    user: { select: { id: true, name: true, email: true } },
    course: { select: { id: true, title: true, level: true } },
  });
  expect(JSON.stringify(args)).not.toContain('passwordHash');
});
```

- [ ] **Step 2: Correr e confirmar falha**

Run: `npx vitest run src/lib/admin/content-repo.test.ts`
Expected: FAIL — `args.include` recebido `{user: true, course: true}`.

- [ ] **Step 3: Alterar `listRows`**

Em `src/lib/admin/content-repo.ts:43-47`, substituir o `include: { user: true, course: true }` por `select` com `user: { select: { id, name, email } }` e `course: { select: { id, title, level } }`.

- [ ] **Step 4: Confirmar passagem**

Run: `npx vitest run src/lib/admin/content-repo.test.ts`
Expected: PASS.

- [ ] **Step 5: Proteger o layout admin**

Em `src/app/[locale]/admin/(protected)/layout.tsx`, após a chamada `requireUser()` (linha ~19), acrescentar `await requireAdmin()` com import de `@/lib/rbac`. Manter o `requireUser()` existente.

Nota: `requireAdmin` exclui `SUPPORT`, `CONTENT`, `INSTRUCTOR` e `STUDENT` do painel. Se o layout precisar de `CONTENT` para o CRUD de conteúdo, usar `requireRole('SUPER_ADMIN', 'ADMIN', 'CONTENT')` — **decisão do implementador**: verificar quem acede hoje ao admin (`src/lib/admin/nav.ts`) e escolher o conjunto mínimo que mantém o comportamento actual excepto `STUDENT`. Documentar a escolha na mensagem do commit.

- [ ] **Step 6: Verificação global**

Run: `npx biome check src messages && npm run typecheck && npx vitest run`
Expected: 0 erros, todos os testes verdes.

- [ ] **Step 7: Commit**

```bash
git add src/lib/admin/content-repo.ts src/lib/admin/content-repo.test.ts "src/app/[locale]/admin/(protected)/layout.tsx"
git commit -m "fix(admin): restringe acesso e elimina passwordHash da listagem"
```

---

### Task 2: Schema Prisma — tabelas novas, enum alargado e migração

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20261206000000_enrollment_wizard/migration.sql`
- Modify: `prisma/seed.ts:190-199` e `:229-254`
- Modify: `src/app/[locale]/aluno/page.tsx:12-18`
- Modify: `src/lib/admin/resources.ts:200-212`
- Modify: `src/app/[locale]/admin/(protected)/[resource]/page.tsx:29-39`
- Modify: `src/actions/registration.ts:175` (criação passa a `DRAFT`)
- Modify: `src/actions/enroll.test.ts:35-43` (expectativa `PENDING` → `DRAFT`)
- Test: `src/lib/enrollment-status-legacy.test.ts` (criar)

**Interfaces:**
- Consumes: nada anterior.
- Produces (usado por todas as tasks seguintes):
  - Modelos `StudentProfile`, `EnrollmentDocument`, `PaymentSubmission`, `EnrollmentStatusHistory`, `Setting`, `Notification`.
  - `Enrollment.currentStep: Int @default(1)`, `Enrollment.submittedAt: DateTime?`.
  - `EnrollmentStatus` = `DRAFT | PENDING_DOCUMENTS | SUBMITTED | UNDER_REVIEW | CORRECTION_REQUIRED | PAYMENT_PENDING_VERIFICATION | APPROVED | REJECTED | CANCELLED`.
  - `DocumentKind` = `BI_FRONT | BI_BACK | PHOTO | PROOF`.
  - `DocumentReviewStatus` = `PENDING | MATCHED | DIVERGENT | NOT_READABLE | APPROVED | REJECTED`.
  - `PaymentMethod` = `EXPRESS | BANK_TRANSFER`.

- [ ] **Step 1: Escrever o teste do mapeamento legado**

`src/lib/enrollment-status-legacy.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { legacyStatusToNew } from './enrollment-status-legacy';

describe('legacyStatusToNew', () => {
  it('mapeia PENDING e PAID para PAYMENT_PENDING_VERIFICATION', () => {
    expect(legacyStatusToNew('PENDING')).toBe('PAYMENT_PENDING_VERIFICATION');
    expect(legacyStatusToNew('PAID')).toBe('PAYMENT_PENDING_VERIFICATION');
  });
  it('mapeia CONFIRMED e COMPLETED para APPROVED', () => {
    expect(legacyStatusToNew('CONFIRMED')).toBe('APPROVED');
    expect(legacyStatusToNew('COMPLETED')).toBe('APPROVED');
  });
  it('mantém CANCELLED', () => {
    expect(legacyStatusToNew('CANCELLED')).toBe('CANCELLED');
  });
  it('nunca produz estados inválidos', () => {
    expect(['APPROVED', 'PAYMENT_PENDING_VERIFICATION', 'CANCELLED'])
      .toContain(legacyStatusToNew('PENDING'));
  });
});
```

- [ ] **Step 2: Correr e confirmar falha**

Run: `npx vitest run src/lib/enrollment-status-legacy.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Criar `src/lib/enrollment-status-legacy.ts`**

Exportar `legacyStatusToNew(status: string): EnrollmentStatus` com o mapa exacto da spec §4.6 (`PENDING|PAID → PAYMENT_PENDING_VERIFICATION`, `CONFIRMED|COMPLETED → APPROVED`, `CANCELLED → CANCELLED`). Usado pelo seed e por qualquer backfill JS.

- [ ] **Step 4: Confirmar passagem**

Run: `npx vitest run src/lib/enrollment-status-legacy.test.ts` → PASS.

- [ ] **Step 5: Alterar `prisma/schema.prisma`**

Acrescentar, seguindo o estilo dos modelos existentes (comentário `///` antes de cada modelo novo):

1. `StudentProfile` — 1:1 `User` (`userId String @unique`, FK `onDelete: Cascade`), campos `nif?`, `biNumber?`, `birthDate DateTime?`, `address?`, `municipality?`, `province?`, `phone?`, `primaryDocumentType String?`, `updatedAt`.
2. `EnrollmentDocument` — FK `enrollmentId` (`onDelete: Cascade`), `kind DocumentKind`, `storageKey String @unique`, `mimeType`, `byteSize Int`, `sha256`, `ocrStatus OcrStatus @default(NOT_RUN)`, `ocrRaw Json?`, `ocrConfidence Float?`, `ocrSource String?`, `reviewStatus DocumentReviewStatus @default(PENDING)`, `reviewedBy User? @relation` (`reviewedById String?`), `rejectionReason?`, `createdAt`, `updatedAt`; `@@unique([enrollmentId, kind])`, `@@index([enrollmentId])`.
3. `PaymentSubmission` — `enrollmentId String @unique` FK, `method PaymentMethod`, `amount Decimal @db.Decimal(12,2)`, `currency String @default("AOA")`, `reference?`, `ocrExtract Json?`, `ocrStatus OcrStatus @default(NOT_RUN)`, `duplicateCheckHash String? @unique`, `reviewStatus DocumentReviewStatus @default(PENDING)`, `reviewedBy User?`, `rejectionReason?`, `createdAt`, `updatedAt`.
4. `EnrollmentStatusHistory` — `enrollmentId` FK, `fromStatus EnrollmentStatus?`, `toStatus EnrollmentStatus`, `actorUserId String?` FK (`SetNull`), `actorRole String?`, `reason String?`, `createdAt`; `@@index([enrollmentId, createdAt])`.
5. `Setting` — `key String @unique`, `value Json`, `updatedBy String?`, `updatedAt`.
6. `Notification` — `userId` FK, `kind String`, `title`, `body`, `href String?`, `read Boolean @default(false)`, `createdAt`; `@@index([userId, read, createdAt])`.
7. Em `User`: `studentProfile StudentProfile?`, `notifications Notification[]`, `reviewedDocuments EnrollmentDocument[]`, `reviewedPayments PaymentSubmission[]`, `statusHistory EnrollmentStatusHistory[]`, `updatedSettings Setting[]`.
8. Em `Enrollment`: `currentStep Int @default(1)`, `submittedAt DateTime?`, relações `documents EnrollmentDocument[]`, `paymentSubmission PaymentSubmission?`, `statusHistory EnrollmentStatusHistory[]`.
9. Enums novos: `OcrStatus`, `DocumentKind`, `DocumentReviewStatus`, `PaymentMethod`.
10. **Substituir** o enum `EnrollmentStatus` pelos 9 valores.
11. `@@index([submittedAt])` em `Enrollment`.

- [ ] **Step 6: Validar o schema**

Run: `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid`.

- [ ] **Step 7: Escrever a migração**

`prisma/migrations/20261206000000_enrollment_wizard/migration.sql` — DDL das tabelas novas + troca de enum com **backfill**. Bloco de troca do enum (exacto):

```sql
ALTER TABLE "Enrollment" ALTER COLUMN "status" DROP DEFAULT;
CREATE TYPE "EnrollmentStatus_new" AS ENUM
  ('DRAFT','PENDING_DOCUMENTS','SUBMITTED','UNDER_REVIEW','CORRECTION_REQUIRED',
   'PAYMENT_PENDING_VERIFICATION','APPROVED','REJECTED','CANCELLED');
ALTER TABLE "Enrollment" ADD COLUMN "status_tmp" "EnrollmentStatus_new";
UPDATE "Enrollment" SET "status_tmp" = CASE "status"
  WHEN 'PENDING'  THEN 'PAYMENT_PENDING_VERIFICATION'
  WHEN 'PAID'     THEN 'PAYMENT_PENDING_VERIFICATION'
  WHEN 'CONFIRMED' THEN 'APPROVED'
  WHEN 'COMPLETED' THEN 'APPROVED'
  WHEN 'CANCELLED' THEN 'CANCELLED'
  ELSE 'PAYMENT_PENDING_VERIFICATION' END;
ALTER TABLE "Enrollment" DROP COLUMN "status";
ALTER TABLE "Enrollment" RENAME COLUMN "status_tmp" TO "status";
ALTER TABLE "Enrollment" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TYPE "EnrollmentStatus" RENAME TO "EnrollmentStatus_old";
ALTER TYPE "EnrollmentStatus_new" RENAME TO "EnrollmentStatus";
DROP TYPE "EnrollmentStatus_old";
```

As tabelas novas usam a `CREATE TABLE` normal do Prisma; escrevê-las à mão seguindo o estilo do schema (chaves `TEXT`, `TIMESTAMP(3)`, `JSONB`, `DECIMAL(12,2)`, `ForeignKey` com nomes no formato `EnrollmentDocument_enrollmentId_fkey`).

- [ ] **Step 8: Verificar contagem de linhas antes/depois (Review Focus #4)**

Antes: `npx prisma db execute --stdin` com `SELECT status, count(*) FROM "Enrollment" GROUP BY status;` e guardar a saída.
Após aplicar: `npx prisma migrate dev --name enrollment_wizard` e repetir a mesma query.
Expected: total de linhas **idêntico**; `CONFIRMED|COMPLETED` → `APPROVED`; `PENDING|PAID` → `PAYMENT_PENDING_VERIFICATION`.

- [ ] **Step 9: Actualizar consumidores do enum**

- `prisma/seed.ts:190-199` → usar `legacyStatusToNew` ou directamente `'APPROVED'`.
- `src/actions/registration.ts:175` → `status: 'DRAFT'`, `currentStep: 1`.
- `src/actions/enroll.test.ts:35-43` → expectativa `'DRAFT'` (mudança deliberada de teste existente).
- `src/app/[locale]/aluno/page.tsx:12-18` → novo mapa `STATUS` com os 9 rótulos PT (ex.: `DRAFT: 'Inscrição iniciada'`, `PAYMENT_PENDING_VERIFICATION: 'Aguarda confirmação de pagamento'`, `APPROVED: 'Inscrição aprovada'`), mantendo as classes `bg-*-bg text-*` existentes.
- `src/lib/admin/resources.ts:200-212` → 9 opções.
- `src/app/[locale]/admin/(protected)/[resource]/page.tsx:29-39` → 9 rótulos.
- `src/lib/admin/dashboard-data.ts:72-78` → alinhar as fatias aos estados reais.

- [ ] **Step 10: Verificação global**

Run: `npx prisma generate && npx biome check src messages && npm run typecheck && npx vitest run`
Expected: 0 erros, todos verdes.

- [ ] **Step 11: Commit**

```bash
git add prisma/schema.prisma prisma/migrations prisma/seed.ts src/lib/enrollment-status-legacy.ts src/lib/enrollment-status-legacy.test.ts src/app/[locale]/aluno/page.tsx src/lib/admin/resources.ts "src/app/[locale]/admin/(protected)/[resource]/page.tsx" src/lib/admin/dashboard-data.ts src/actions/registration.ts src/actions/enroll.test.ts
git commit -m "feat(db): modelo do wizard de inscrição e enum de estados alargado"
```

---

### Task 3: Máquina de estados e histórico

**Files:**
- Create: `src/lib/enrollment-state.ts`
- Test: `src/lib/enrollment-state.test.ts`

**Interfaces:**
- Consumes: `EnrollmentStatus` e `EnrollmentStatusHistory` da Task 2.
- Produces:
```ts
export type Actor = { userId: string; role: UserRole };
export type TransitionCode = 'NOT_ALLOWED' | 'FORBIDDEN' | 'MISSING_REQUIREMENTS';
export type TransitionResult =
  | { ok: true; to: EnrollmentStatus }
  | { ok: false; code: TransitionCode; message: string };
export function canTransition(from: EnrollmentStatus, to: EnrollmentStatus, role: UserRole): boolean;
export function missingRequirements(input: {
  profileComplete: boolean;
  documentKinds: DocumentKind[];
  documentsApproved: boolean;
  paymentApproved: boolean;
}): Array<'profile' | 'documents' | 'payment'>;
export function transitionEnrollment(input: {
  enrollmentId: string; to: EnrollmentStatus; actor: Actor; reason?: string;
}): Promise<TransitionResult>;
```

- [ ] **Step 1: Escrever os testes que falham**

`src/lib/enrollment-state.test.ts`, com `vi.mock('@/lib/prisma')` e `vi.mock('@/lib/audit')` (padrão de `src/actions/registration.test.ts:12-13`). Casos:

```ts
it('estudante envia DRAFT -> PENDING_DOCUMENTS', ...)
it('estudante submete PENDING_DOCUMENTS -> SUBMITTED', ...)
it('estudante NÃO pode ir para SUBMITTED directamente desde DRAFT', ...)
it('estudante NÃO pode aprovar (APPROVED)', () => expect(canTransition('PAYMENT_PENDING_VERIFICATION','APPROVED','STUDENT')).toBe(false))
it('SUPPORT NÃO pode confirmar pagamento nem aprovar', ...)
it('ADMIN pode ir UNDER_REVIEW -> PAYMENT_PENDING_VERIFICATION', ...)
it('recusa APPROVED quando falta validação', () => {
  expect(missingRequirements({ profileComplete: true, documentKinds: ['BI_FRONT','BI_BACK','PHOTO','PROOF'], documentsApproved: false, paymentApproved: true })).toContain('documents');
});
it('ADMIN pode recusar com reason obrigatório', ...)
it('gravar histórico com actorUserId e toStatus', ...)
```

- [ ] **Step 2: Correr e confirmar falha**

Run: `npx vitest run src/lib/enrollment-state.test.ts` → FAIL (módulo inexistente).

- [ ] **Step 3: Implementar `src/lib/enrollment-state.ts`**

- `TRANSITIONS` como array `readonly` de `{ from, to, roles }` exactamente com a tabela da spec §5.
- `canTransition` consulta `TRANSITIONS` (papéis `SUPER_ADMIN|ADMIN` para `APPROVED` e `REJECTED`; `SUPPORT` nunca em `APPROVED`).
- `missingRequirements` é **puro** (testável sem BD): devolve `['profile']` se `!profileComplete`; `['documents']` se faltar algum dos 4 `DocumentKind` ou `!documentsApproved`; `['payment']` se `!paymentApproved`. Para `APPROVED` exige `documentsApproved && paymentApproved && profileComplete`.
- `transitionEnrollment`: valida `canTransition`, chama `missingRequirements` quando `to === 'APPROVED'`, e dentro de `prisma.$transaction` grava `Enrollment.update({ status: to, ... })` + `EnrollmentStatusHistory.create({ fromStatus, toStatus: to, actorUserId, actorRole, reason })` + `audit({ userId, action: 'enrollment.transition', entityType: 'enrollment', entityId, metadata: { from, to, reason } })`.

- [ ] **Step 4: Confirmar passagem**

Run: `npx vitest run src/lib/enrollment-state.test.ts` → PASS.

- [ ] **Step 5: Verificação global**

Run: `npx biome check src messages && npm run typecheck && npx vitest run` → 0 erros.

- [ ] **Step 6: Commit**

```bash
git add src/lib/enrollment-state.ts src/lib/enrollment-state.test.ts
git commit -m "feat(enrollment): máquina de estados com histórico auditado"
```

---

### Task 4: Dados de localização (AngoAPI) e configuração de pagamento

**Files:**
- Create: `src/content/angola-locations.ts`
- Create: `src/lib/payment-settings.ts`
- Test: `src/lib/payment-settings.test.ts`

**Interfaces:**
- Consumes: modelo `Setting` da Task 2.
- Produces:
```ts
// src/content/angola-locations.ts
export type Province = { code: string; name: string };
export type Municipality = { code: string; name: string };
export const PROVINCES: readonly Province[];
export function municipalitiesFor(provinceCode: string): Municipality[];
```
```ts
// src/lib/payment-settings.ts
export type PaymentSettings = { bank: string | null; express: string | null; instructions: string | null };
export async function getPaymentSettings(): Promise<PaymentSettings>;
export const SETTING_KEYS = { bank: 'payment.bank', express: 'payment.express', instructions: 'payment.instructions' } as const;
```

- [ ] **Step 1: Escrever o teste que falha**

`src/lib/payment-settings.test.ts`:
```ts
it('devolve null quando a configuração não existe (sem inventar dados)', async () => {
  prismaMock.setting.findMany.mockResolvedValue([]);
  expect(await getPaymentSettings()).toEqual({ bank: null, express: null, instructions: null });
});
it('nunca devolve IBAN por defeito', async () => { ... expect(result.bank).not.toMatch(/AO\d\d/); });
it('lê as três chaves configuradas pelo admin', async () => { ... });
```

- [ ] **Step 2: Correr e confirmar falha** — `npx vitest run src/lib/payment-settings.test.ts` → FAIL.

- [ ] **Step 3: Implementar `src/content/angola-locations.ts`**

Copiar **literalmente** as listas de `GET /api/gateway/location/provinces` e `/municipalities` da AngoAPI (repositório `Masukulmiguel/angoapi`, `app/Http/Controllers/Api/V1/Gateway/LocationController.php`): 19 províncias; municípios de `BGO`, `BGU`, `LUA`. `municipalitiesFor` devolve `[]` para províncias sem lista. Acrescentar comentário de proveniência e data.

- [ ] **Step 4: Implementar `src/lib/payment-settings.ts`**

`getPaymentSettings()` lê `prisma.setting.findMany({ where: { key: { in: [...] } } })` e devolve o objecto. Ausente → `null`.

- [ ] **Step 5: Confirmar passagem** — `npx vitest run src/lib/payment-settings.test.ts` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/angola-locations.ts src/lib/payment-settings.ts src/lib/payment-settings.test.ts
git commit -m "feat(content): províncias/municípios e configuração de pagamento"
```

---

### Task 5: Esquemas Zod das 5 etapas

**Files:**
- Create: `src/lib/enrollment-wizard/schemas.ts`
- Test: `src/lib/enrollment-wizard/schemas.test.ts`

**Interfaces:**
- Consumes: `zod` (já em `package.json:36`).
- Produces (usado pelas Tasks 6, 9, 10 e pela UI):
```ts
export const step1Schema = z.object({
  primaryDocumentType: z.enum(['NIF', 'BI']),
  nif: z.string().trim().regex(/^\d{9,10}$/).optional().or(z.literal('')),
  biNumber: z.string().trim().min(6).max(20),
  fullName: z.string().trim().min(2).max(120),
  birthDate: z.string().refine((v) => !Number.isNaN(Date.parse(v))),
  address: z.string().trim().min(3).max(240),
  municipality: z.string().trim().min(2).max(120),
  province: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?\d{9,15}$/),
  email: z.string().email().max(190),
});
export const step4Schema = z.object({
  method: z.enum(['EXPRESS', 'BANK_TRANSFER']),
  amount: z.number().positive(),
  reference: z.string().trim().max(120).optional(),
  paymentDate: z.string(),
  ocrValue: z.string().optional(),
  ocrReference: z.string().optional(),
});
export type Step1Input = z.infer<typeof step1Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
```

- [ ] **Step 1: Escrever os testes** — `schemas.test.ts` com: aceita `biNumber` de 14 dígitos e rejeita 3; `phone` angolano `+244923000000` aceite, `abc` rejeitado; `birthDate` `1990-01-13` aceite, `13/01/1990` rejeitado (formato ISO obrigatório); `amount` negativo rejeitado; `method` `'PIX'` rejeitado.
- [ ] **Step 2: Correr e confirmar falha** — `npx vitest run src/lib/enrollment-wizard/schemas.test.ts` → FAIL.
- [ ] **Step 3: Implementar `src/lib/enrollment-wizard/schemas.ts`** com as assinaturas acima e mensagens de erro em PT por campo.
- [ ] **Step 4: Confirmar passagem** → PASS.
- [ ] **Step 5: Commit** — `feat(wizard): esquemas de validação das etapas`.

---

### Task 6: Camada de armazenamento de documentos

**Files:**
- Create: `src/lib/storage/enrollment-documents.ts`
- Create: `src/lib/storage/magic-bytes.ts`
- Modify: `next.config.ts:12` (`Permissions-Policy: camera=()`)
- Test: `src/lib/storage/magic-bytes.test.ts`, `src/lib/storage/enrollment-documents.test.ts`
- Deps: `npm i @supabase/supabase-js`

**Interfaces:**
- Produces:
```ts
export type DocKind = 'BI_FRONT' | 'BI_BACK' | 'PHOTO' | 'PROOF';
export function sniffMimeType(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'application/pdf' | null;
export function storageKeyFor(userId: string, enrollmentId: string, kind: DocKind): string;
export function assertOwnedDocument(enrollment: { userId: string }, actor: { userId: string; role: UserRole }): void; // lança AuthError
export async function uploadEnrollmentDocument(input: {
  enrollmentId: string; userId: string; kind: DocKind;
  bytes: Uint8Array; declaredType: string;
}): Promise<{ storageKey: string; mimeType: string; byteSize: number; sha256: string }>;
export async function createEnrollmentDocumentUrl(storageKey: string, actor: Actor): Promise<string>;
```

- [ ] **Step 1: Escrever o teste de magic bytes** — `sniffMimeType` detecta JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), PDF (`25 50 44 46`); devolve `null` para ZIP (`50 4B`) e para conteúdo aleatório; rejeita `.jpg` cujo conteúdo é `PK`.
- [ ] **Step 2: Correr e confirmar falha** → FAIL.
- [ ] **Step 3: Implementar `magic-bytes.ts`** — só inspecção dos primeiros 8 bytes, sem dependências.
- [ ] **Step 4: Confirmar passagem** → PASS.
- [ ] **Step 5: Escrever o teste de propriedade (Review Focus #1)** — `createEnrollmentDocumentUrl` lança `AuthError('FORBIDDEN')` quando `actor.userId !== enrollment.userId` e `actor.role` não está em `['SUPER_ADMIN','ADMIN','SUPPORT']`; devolve URL quando é o dono; devolve URL quando `role === 'ADMIN'` e `userId` diferente.
- [ ] **Step 6: Correr e confirmar falha** → FAIL.
- [ ] **Step 7: Alterar `next.config.ts:12`**

`{ key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' }` — sem isto a captura pela câmara do telemóvel é bloqueada pelo header. Manter o resto.

- [ ] **Step 8: Implementar `enrollment-documents.ts`**
  - `storageKeyFor` → `` `${userId}/${enrollmentId}/${kind}` `` (sem NIF, sem nome).
  - `uploadEnrollmentDocument`: valida `sniffMimeType(bytes) !== null` e `mimeType === declaredType` (quando `declaredType` for `image/jpeg|image/png|application/pdf`); rejeita se `bytes.length > 8 * 1024 * 1024`; calcula SHA-256 com `node:crypto`; faz `supabase.storage.from(BUCKET).upload(key, bytes, { contentType, upsert: true })`; devolve `{ storageKey, mimeType, byteSize, sha256 }`.
  - `createEnrollmentDocumentUrl`: `assertOwnedDocument` primeiro, depois `createSignedUrl(key, 600)`.
  - Bucket: `process.env.SUPABASE_ENROLLMENT_BUCKET ?? 'enrollment-documents'`. Env exigida: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Se ausente → erro claro `Storage não configurado`, nunca fallback para `public/`.
- [ ] **Step 9: Confirmar passagem** → PASS.
- [ ] **Step 10: Verificação global** — `npx biome check src messages && npm run typecheck && npx vitest run` → 0 erros.
- [ ] **Step 11: Commit** — `feat(storage): upload privado de documentos com URL assinada`.

---

### Task 7: OCR e comparação de identidade

**Files:**
- Create: `src/lib/ocr/compare.ts`
- Create: `src/lib/ocr/extract-amount.ts`
- Create: `src/lib/ocr/run-client-ocr.ts`
- Test: `src/lib/ocr/compare.test.ts`, `src/lib/ocr/extract-amount.test.ts`, `src/lib/ocr/run-client-ocr.test.ts`
- Deps: `npm i tesseract.js`

**Interfaces:**
- Produces:
```ts
export type FieldOutcome = 'MATCH' | 'DIFFERENT' | 'UNKNOWN';
export type ComparedField = { field: string; registered: string; extracted: string | null; outcome: FieldOutcome };
export function normalizeText(value: string): string;              // trim, colapsa espaços, minúsculas, sem acentos
export function normalizeDate(value: string): string | null;       // aceita 'dd/mm/aaaa' e 'yyyy-mm-dd' -> 'yyyy-mm-dd'
export function compareIdentity(registered: {
  fullName: string; biNumber: string; birthDate: string;
}, extracted: { fullName?: string; biNumber?: string; birthDate?: string }): ComparedField[];
export function parseAmountKz(value: string): number | null;       // '75.000,00 Kz' -> 75000
```
```ts
// run-client-ocr.ts — módulo 'use client'; nunca importado por actions do servidor
export type ExtractedIdentity = { fullName?: string; biNumber?: string; birthDate?: string; confidence: number; raw: string };
export type ExtractedProof = { amount?: string; paymentDate?: string; reference?: string; confidence: number; raw: string };
export async function runIdentityOcr(file: File): Promise<ExtractedIdentity>;
export async function runProofOcr(file: File): Promise<ExtractedProof>;
```
O payload devolvido por `runIdentityOcr` é o que a Etapa 2 envia em `formData` (`ocrFullName`, `ocrBiNumber`, `ocrBirthDate`, `ocrConfidence`, `ocrRaw`) — é este contrato que `saveStep2` (Task 8) lê.

- [ ] **Step 1: Escrever testes de `normalizeText`/`normalizeDate`** — `'Maria  Silva'` → `'maria silva'`; `'José António'` → `'jose antonio'`; `'13/01/1990'` → `'1990-01-13'`; `'1990-1-3'` → `'1990-01-03'`; `'abc'` → `null`.
- [ ] **Step 2: Correr e confirmar falha** → FAIL.
- [ ] **Step 3: Escrever testes de `compareIdentity`** — nome igual com acentos diferentes → `MATCH`; nome diferente → `DIFFERENT`; extraído ausente → `UNKNOWN`; BI `'004512345LA041'` vs `'004512345 LA 041'` → `MATCH` (pontuação removida); data em formato inesperado → `UNKNOWN`.
- [ ] **Step 4: Correr e confirmar falha** → FAIL.
- [ ] **Step 5: Implementar `compare.ts`** com as assinaturas acima.
- [ ] **Step 6: Testes de `parseAmountKz`** — `'75.000,00 Kz'`→`75000`; `'75000 Kz'`→`75000`; `'Kz 75.000'`→`75000`; `'abc'`→`null`; `'1.234.567,89'`→`1234567.89`.
- [ ] **Step 7: Correr, implementar `extract-amount.ts`, confirmar passagem** → PASS.
- [ ] **Step 8: Testes do runner de OCR no cliente** — `run-client-ocr.test.ts` com `vi.mock('tesseract.js', ...)` devolvendo `createWorker` falso:
  - `runIdentityOcr` devolve `confidence` entre 0 e 1 e `raw` não vazio;
  - devolve `{ fullName: undefined }` quando o texto não contém padrão reconhecível (não lança);
  - falha do worker → devolve objeto com `confidence: 0` e `raw: ''` (a Etapa 2 continua e marca `NOT_READABLE`);
  - `runProofOcr` usa `parseAmountKz` para `amount`.
- [ ] **Step 9: Correr e confirmar falha** → FAIL.
- [ ] **Step 10: Implementar `run-client-ocr.ts`** com `'use client'`, `createWorker('por+eng')`, e extracção por expressões regulares sobre o texto (nome: primeira linha não vazia; BI: `\d{9,12}[A-Z]{1,3}\d{1,3}`; data: `\d{2}[/-]\d{2}[/-]\d{4}`). Worker criado por chamada e terminado no `finally`.
- [ ] **Step 11: Confirmar passagem** → PASS.
- [ ] **Step 12: Commit** — `feat(ocr): normalização, comparação e runner no cliente`.

---

### Task 8: Actions das Etapas 1-3 (perfil, documentos, fotografia)

**Files:**
- Create: `src/actions/enrollment-wizard/common.ts`
- Create: `src/actions/enrollment-wizard/step1.ts`
- Create: `src/actions/enrollment-wizard/step2.ts`
- Create: `src/actions/enrollment-wizard/step3.ts`
- Test: `src/actions/enrollment-wizard/step1.test.ts`, `step2.test.ts`

**Interfaces:**
- Consumes: `step1Schema` (Task 5), `uploadEnrollmentDocument` (Task 6), `compareIdentity` e o payload `ExtractedIdentity` de `run-client-ocr.ts` (Task 7), `canTransition` (Task 3).
- Produces:
```ts
// common.ts
export type WizardActionResult = {
  ok: boolean;
  errors?: Record<string, string>;
  message?: string;
  nextStep?: number;
  comparison?: ComparedField[];
};
export async function loadOwnedEnrollment(enrollmentId: string): Promise<Enrollment>; // lança notFound() se não for do dono
export async function applyCorrectionIfNeeded(enrollment: Enrollment, actor: Actor): Promise<void>;
```
```ts
export async function saveStep1(enrollmentId: string, prev: WizardActionResult | null, formData: FormData): Promise<WizardActionResult>;
export async function saveStep2(enrollmentId: string, prev: WizardActionResult | null, formData: FormData): Promise<WizardActionResult>;
export async function saveStep3(enrollmentId: string, prev: WizardActionResult | null, formData: FormData): Promise<WizardActionResult>;
```

- [ ] **Step 1: Testes de `saveStep1`** (`vi.mock('@/lib/prisma')`, `vi.mock('@/lib/auth')`, `vi.mock('next/headers')` — padrão de `src/actions/registration.test.ts`):
  - rejeita dados inválidos devolvendo `errors` por campo e **não** escrevendo em BD;
  - cria/atualiza `StudentProfile` do dono e grava `currentStep: 2`;
  - lança erro quando o `enrollment.userId` difere do actor;
  - nunca devolve `passwordHash` na resposta.
- [ ] **Step 2: Correr e confirmar falha** → FAIL.
- [ ] **Step 3: Implementar `common.ts` e `step1.ts`.**
- [ ] **Step 4: Confirmar passagem** → PASS.
- [ ] **Step 5: Testes de `saveStep2`**:
  - rejeita ficheiro cujos magic bytes não correspondem ao tipo declarado;
  - rejeita ficheiro > 8 MB;
  - grava `EnrollmentDocument` com `kind` correcto e `storageKey` do padrão `{userId}/{enrollmentId}/{kind}`;
  - devolve `comparison` com os 3 campos e um outcome cada;
  - não altera o estado da inscrição para `APPROVED` (asserção explícita).
- [ ] **Step 6: Correr, implementar `step2.ts`, confirmar passagem** → PASS.
- [ ] **Step 7: Implementar `step3.ts`** — reutiliza `uploadEnrollmentDocument` com `kind: 'PHOTO'`; sem OCR; devolve `nextStep: 4`. Sem teste próprio (coberto pelo padrão da Task 6); correr `npx vitest run` para garantir regressão zero.
- [ ] **Step 8: Verificação global** → 0 erros.
- [ ] **Step 9: Commit** — `feat(wizard): etapas 1-3 com perfil e documentos`.

---

### Task 9: Etapa 4 — pagamento e comprovativo

**Files:**
- Create: `src/actions/enrollment-wizard/step4.ts`
- Create: `src/lib/payments/duplicate-hash.ts`
- Test: `src/lib/payments/duplicate-hash.test.ts`, `src/actions/enrollment-wizard/step4.test.ts`

**Interfaces:**
- Consumes: `step4Schema` (Task 5), `getPaymentSettings` (Task 4), `parseAmountKz` (Task 7), `uploadEnrollmentDocument` (Task 6), `canTransition` (Task 3), e `WizardActionResult` + `loadOwnedEnrollment` de `src/actions/enrollment-wizard/common.ts` (Task 8).
- Produces:
```ts
export function paymentDuplicateHash(input: { reference: string | null; amount: number; paymentDate: string }): string;
export async function saveStep4(enrollmentId: string, prev: WizardActionResult | null, formData: FormData): Promise<WizardActionResult>;
```

- [ ] **Step 1: Testes de `paymentDuplicateHash`** — mesma referência+valor+data → hash idêntico; referência diferente → hash diferente; valor `75000` vs `75000.00` → idêntico; `reference: null` usa `''`; hash é hex de 64 caracteres (SHA-256).
- [ ] **Step 2: Correr e confirmar falha** → FAIL.
- [ ] **Step 3: Implementar `duplicate-hash.ts`** com `createHash('sha256').update(...)` de `reference.trim().toLowerCase() | amount.toFixed(2) | paymentDate`.
- [ ] **Step 4: Confirmar passagem** → PASS.
- [ ] **Step 5: Testes de `saveStep4`** (Review Focus #3):
  - lê `Course.price` da BD e **ignora** o valor enviado pelo cliente para a decisão (usa o valor do curso como oficial);
  - se `ocrValue` difere de `Course.price` → devolve `message` de divergência e grava `reviewStatus: 'DIVERGENT'`, **sem** mudar para `APPROVED`;
  - hash já existente noutro `PaymentSubmission` → `ok: false`, `message` contém `'já utilizado'`, nada é gravado;
  - `getPaymentSettings()` com tudo `null` → devolve `message` `'dados de pagamento em configuração'` e **não** inventa IBAN;
  - transição `DRAFT → PENDING_DOCUMENTS` ao concluir, gravando histórico.
- [ ] **Step 6: Correr, implementar `step4.ts`, confirmar passagem** → PASS.
- [ ] **Step 7: Verificação global** → 0 erros.
- [ ] **Step 8: Commit** — `feat(wizard): etapa 4 com anti-duplicação de comprovativo`.

---

### Task 10: Etapa 5 — revisão e submissão

**Files:**
- Create: `src/actions/enrollment-wizard/step5.ts`
- Test: `src/actions/enrollment-wizard/step5.test.ts`

**Interfaces:**
- Consumes: `transitionEnrollment` (Task 3), `loadOwnedEnrollment` (Task 8).
- Produces: `export async function submitEnrollment(enrollmentId: string, prev: WizardActionResult | null, formData: FormData): Promise<WizardActionResult>;`

- [ ] **Step 1: Testes**
  - exige os 4 `DocumentKind` presentes caso contrário `ok: false` com `message` listando o que falta;
  - exige `termsAccepted === 'on'` caso contrário erro no campo `terms`;
  - submissão válida → `PENDING_DOCUMENTS → SUBMITTED`, `submittedAt` preenchido e histórico gravado;
  - submissão sem perfil completo → rejeitado;
  - resposta não contém campos sensíveis.
- [ ] **Step 2: Correr e confirmar falha** → FAIL.
- [ ] **Step 3: Implementar `step5.ts`.**
- [ ] **Step 4: Confirmar passagem** → PASS.
- [ ] **Step 5: Commit** — `feat(wizard): submissão para validação`.

---

### Task 11: UI do wizard (stepper, 5 rotas, componentes)

**Files:**
- Create: `src/components/enrollment/stepper.tsx`
- Create: `src/components/enrollment/file-dropzone.tsx` (captura `capture="environment"`, galeria, pré-visualização, substituição, recorte via `react-easy-crop`)
- Create: `src/components/enrollment/ocr-comparison-table.tsx`
- Create: `src/components/enrollment/steps/step-1.tsx` … `step-5.tsx`
- Create: `src/app/[locale]/aluno/inscricao/[enrollmentId]/page.tsx` (redirect para etapa actual)
- Create: `src/app/[locale]/aluno/inscricao/[enrollmentId]/etapa/[n]/page.tsx`
- Create: `src/app/[locale]/aluno/inscricao/[enrollmentId]/layout.tsx`
- Deps: `npm i react-easy-crop`
- Test: `src/components/enrollment/stepper.test.tsx` (render puro, sem DOM pesado)

**Interfaces:**
- Consumes: as 5 actions das Tasks 8-10, `PROVINCES`/`municipalitiesFor` (Task 4), `compareIdentity` (Task 7), `getPaymentSettings` (Task 4).
- Produces: rotas `/[locale]/aluno/inscricao/[enrollmentId]` e `/etapa/[n]` com `n ∈ 1..5`.

- [ ] **Step 1: Teste do `Stepper`** — renderiza 5 etapas; marca a actual; mostra "Etapa 3 de 5" e "Faltam 2"; as concluídas têm `aria-current` ausente e as futuras têm `aria-disabled="true"`.
- [ ] **Step 2: Correr e confirmar falha** → FAIL.
- [ ] **Step 3: Implementar `stepper.tsx`.** Seguir o padrão visual de `src/components/training/enroll-panel.tsx` (classes `btn-primary`, tokens `text-ink`, `bg-surface-muted`).
- [ ] **Step 4: Confirmar passagem** → PASS.
- [ ] **Step 5: Implementar `file-dropzone.tsx`** com `<input type="file" accept="image/*,application/pdf" capture="environment">`, pré-visualização, botão substituir e recorte. Copy de orientações da Etapa 3 literal da spec §Etapa 3.
- [ ] **Step 6: Implementar as 5 rotas e os 5 componentes de etapa**, incluindo:
  - Etapa 1: ecrã de **resumo de confirmação** antes de avançar (spec §Etapa 1) e dropdowns de província/município ligados.
  - Etapa 2: tabela de comparação (`ocr-comparison-table.tsx`) com as 3 colunas e os 3 resultados, + aviso literal: *"A leitura automática é uma proposta de preenchimento. Não confirma a autenticidade do documento. A validação é feita por um funcionário autorizado."*
  - Etapa 4: dois cartões de método, dados do curso da BD, dados de pagamento de `getPaymentSettings()`, aviso literal: *"A leitura automática não confirma que o pagamento foi recebido. O pagamento só é confirmado por um funcionário responsável."*
  - Etapa 5: lista de revisão + checkbox de termos + botão **"Submeter inscrição para validação."**
- [ ] **Step 7: Verificação global** → 0 erros.
- [ ] **Step 8: Commit** — `feat(wizard): interface das 5 etapas`.

---

### Task 12: Área do formando — entrada no wizard e notificações in-app

**Files:**
- Modify: `src/app/[locale]/aluno/page.tsx`
- Create: `src/actions/enrollment-wizard/start.ts`
- Create: `src/components/enrollment/notification-list.tsx`
- Test: `src/actions/enrollment-wizard/start.test.ts`

**Interfaces:**
- Consumes: `EnrollmentStatus` actualizado (Task 2), `Notification` (Task 2).
- Produces: `export async function startOrResumeWizard(enrollmentId: string): Promise<{ step: number }>;`

- [ ] **Step 1: Testes de `startOrResumeWizard`**
  - devolve `currentStep` guardado (retoma onde ficou);
  - cria `StudentProfile` vazio se não existir;
  - devolve o `step` correcto consoante o estado (`APPROVED` → devolve `{ step: 0 }` para indicar que não há wizard);
  - não devolve `passwordHash` nem `totpSecretEnc`.
- [ ] **Step 2: Correr e confirmar falha** → FAIL.
- [ ] **Step 3: Implementar `start.ts`.**
- [ ] **Step 4: Confirmar passagem** → PASS.
- [ ] **Step 5: Alterar `src/app/[locale]/aluno/page.tsx`**
  - por cada inscrição, botão **"Continuar inscrição"** quando `status ∈ {DRAFT, PENDING_DOCUMENTS, CORRECTION_REQUIRED}` → `/{locale}/aluno/inscricao/{id}`;
  - mostrar `Notification` não lidas no topo (leitura, marcar como lida numa action pequena);
  - manter intactos os blocos de presenças, materiais e certificados (linhas 96-207).
- [ ] **Step 6: Verificação global** → 0 erros.
- [ ] **Step 7: Commit** — `feat(aluno): retoma do wizard e notificações in-app`.

---

### Task 13: Acções administrativas de validação

**Files:**
- Create: `src/actions/admin/enrollment-review.ts`
- Modify: `src/app/[locale]/admin/(protected)/[resource]/[id]/page.tsx` (abas e acções)
- Create: `src/components/admin/enrollment-review-panel.tsx`
- Test: `src/actions/admin/enrollment-review.test.ts`

**Interfaces:**
- Consumes: `transitionEnrollment` (Task 3), `createEnrollmentDocumentUrl` (Task 6).
- Produces:
```ts
export async function reviewDocument(input: { enrollmentId: string; documentId: string; decision: 'APPROVED' | 'REJECTED' | 'DIVERGENT' | 'NOT_READABLE'; reason?: string }): Promise<{ ok: boolean; message?: string }>;
export async function reviewPayment(input: { enrollmentId: string; decision: 'APPROVED' | 'REJECTED'; reason?: string }): Promise<{ ok: boolean; message?: string }>;
export async function requestCorrection(input: { enrollmentId: string; fields: string[]; message: string }): Promise<{ ok: boolean }>;
export async function assignReviewer(input: { enrollmentId: string; reviewerId: string }): Promise<{ ok: boolean }>;
export async function approveEnrollment(input: { enrollmentId: string; reason?: string }): Promise<{ ok: boolean; message?: string }>;
export async function rejectEnrollment(input: { enrollmentId: string; reason: string }): Promise<{ ok: boolean }>;
```

- [ ] **Step 1: Testes**
  - `reviewDocument` exige role `SUPER_ADMIN|ADMIN|SUPPORT` e `SUPPORT` **não** pode `APPROVED` em pagamento;
  - `approveEnrollment` **falha** com `message` listando requisitos em falta quando `missingRequirements` devolve algo;
  - `requestCorrection` exige `message` não vazio e muda para `CORRECTION_REQUIRED` com histórico;
  - `rejectEnrollment` exige `reason`;
  - toda a acção escreve `audit` com `entityType: 'enrollment'` e `actorUserId`;
  - resposta não contém `passwordHash`.
- [ ] **Step 2: Correr e confirmar falha** → FAIL.
- [ ] **Step 3: Implementar `enrollment-review.ts`** — todas as acções passam por `transitionEnrollment` ou por updates de `EnrollmentDocument`/`PaymentSubmission` + `audit`. Nenhuma escreve `status` directamente.
- [ ] **Step 4: Confirmar passagem** → PASS.
- [ ] **Step 5: UI** — separadores **Dados pessoais / Documentos / Pagamento / Curso / Histórico** em `enrollment-review-panel.tsx`, com imagens por `createEnrollmentDocumentUrl`, tabela de comparação OCR e botões de acção. Listagem em `[id]/page.tsx` com `requireRole('SUPER_ADMIN','ADMIN','SUPPORT')`.
- [ ] **Step 6: Verificação global** → 0 erros.
- [ ] **Step 7: Commit** — `feat(admin): validação documental e financeira de inscrições`.

---

### Task 14: Verificação final do sub-projecto A

- [ ] **Step 1: Suíte completa** — `npx biome check src messages && npm run typecheck && npx vitest run`
  Expected: 0 erros, todos verdes (os 33 existentes + os novos).
- [ ] **Step 2: Build** — parar dev server; `npm run build`
  Expected: exit 0; rotas `/[locale]/aluno/inscricao/[enrollmentId]` e `/etapa/[n]` presentes como dinâmicas.
- [ ] **Step 3: Percurso manual e2e (Playwright, local)** — registar conta, escolher curso, completar as 5 etapas com imagens falsas válidas, submeter, e confirmar: `SUBMITTED` na BD; `APPROVED` **inalcançável** pela UI; sair a meio e retomar na etapa certa.
- [ ] **Step 4: Regressão de segurança** — confirmar que um utilizador `STUDENT` obtém redirect/erro em `/pt/admin` e que nenhuma action devolve `passwordHash`.
- [ ] **Step 5: Sem deploy** — não correr `vercel`. Não commitar sem autorização.
