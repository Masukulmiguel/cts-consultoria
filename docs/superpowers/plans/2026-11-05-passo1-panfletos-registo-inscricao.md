# Passo 1 — Panfletos do admin + inscrição com criação de conta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Os panfletos passam a ser os cursos publicados pelo admin (com descrição no hover e botão "Inscrever-se"), e um formando cria a sua conta na base de dados e inscreve-se no curso a partir da página do curso.

**Architecture:** Server actions novas (`registerStudent`, `enrollInCourse`) em `src/actions/registration.ts`, com validação Zod em `src/lib/registration.ts` (lógica pura, testável). A grelha de panfletos em `training-view.tsx` deixa de usar a constante `FLYERS` estática e passa a iterar `getPublicCourses()`. Novo `CourseDetailView` em `/{locale}/formacao/{slug}` (reutilizando o segmento dinâmico `[section]/[slug]`) com um painel client `EnrollPanel` que oferece "Criar conta", "Já tenho conta" e "Confirmar inscrição".

**Tech Stack:** Next.js 15 (App Router), React 19, Prisma 6 + PostgreSQL (Supabase), Auth.js v5 (Credentials, sessão JWT), Zod, bcryptjs, Tailwind v4, Vitest, Playwright (verificação manual).

**Spec:** `docs/superpowers/specs/2026-11-05-cts-contas-inscricao-pagamento-dashboards-design.md` (secções 4 e 7; o Passo 2 — pagamentos — e o Passo 3 — dashboards reais — têm planos próprios).

## Global Constraints

- Senhas nunca em claro, nunca em logs, nunca na auditoria. Hash sempre via `hashPassword()` de `src/lib/password.ts` (bcrypt, 12 rounds).
- Contas criadas por esta via têm `role: 'STUDENT'`, `totpEnabled: false`, `locale` igual ao da página.
- Limite de registos: máximo 5 por `ipHash` e 5 por email em 24 h, contado em `AuditLog` (persistido). O `rateLimit()` em memória (`src/lib/rate-limit.ts`) não é fiável em serverless.
- Email inexistente e email já registado devolvem **a mesma mensagem** ("Esse email já tem conta. Use "Já tenho conta".") — nunca revelar o papel da conta.
- Hash de IP para auditoria/limite: `sha256(`${ip}:${process.env.AUTH_SECRET ?? 'dev'}`)` — o mesmo padrão já usado em `src/actions/contact.ts:63-65`.
- Textos bilíngues no padrão dos views existentes: `const isPt = locale === 'pt'` e ternários inline. Não introduzir chaves novas em `messages/*.json`.
- Rotas sempre com prefixo de locale: `/{locale}/formacao/{slug}` (PT) e `/{locale}/training/{slug}` (EN).
- Comandos de verificação: `npx biome check .`, `npm run typecheck`, `npx vitest run`, `npm run build`.
- **Não correr `npm run build` com o dev server a correr** (corrompe `.next`): parar o dev server antes, voltar a arrancá-lo depois.
- **Commits:** os passos de commit abaixo só são executados se o utilizador autorizar explicitamente o commit (por omissão, não commitar).

## Review Focus

1. **Email já registado** — o formando tem de conseguir entrar com a conta que já tem; a resposta não pode revelar se o email é de admin ou de formando, nem devolver 500.
2. **Duplo envio do formulário** — dois cliques em "Criar conta" não podem criar dois utilizadores nem devolver erro 500; no máximo um utilizador, e o segundo intento devolve "email já tem conta".
3. **Palavra-passe fraca ou confirmação divergente** — validação com mensagem por campo, sem criar utilizador na BD.
4. **Curso despublicado entre o clique e o submit** — `enrollInCourse` tem de rejeitar o curso que já não está `published` (sem criar inscrição), não criar inscrição órfã.
5. **Descrição do panfleto** — tem de ser alcançável por teclado (`focus-within`) e estar visível em mobile sem hover (não só com `group-hover`).

---

### Task 1: Regras de validação do registo (lógica pura)

**Files:**
- Create: `src/lib/registration.ts`
- Test: `src/lib/registration.test.ts`

**Interfaces:**
- Consumes: nada (primeira task).
- Produces:
  - `export const registrationSchema: z.ZodObject<...>` — campos `email` (string, email, max 190), `name` (string, trim, 2-80), `password` (string, min 8, max 128).
  - `export function normalizeEmail(email: string): string` — `email.trim().toLowerCase()`.
  - `export function passwordProblem(password: string): string | null` — devolve `null` se aceitável; caso contrário uma mensagem em português: `'A palavra-passe precisa de pelo menos 8 caracteres.'` ou `'A palavra-passe não pode passar de 128 caracteres.'`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { normalizeEmail, passwordProblem, registrationSchema } from './registration';

describe('regras de registo', () => {
  it('normaliza o email', () => {
    expect(normalizeEmail('  Maria@CTS.Angola ')).toBe('maria@cts.angola');
  });

  it('rejeita email inválido', () => {
    expect(registrationSchema.safeParse({ email: 'nao-e-email', name: 'Maria', password: 'segredo123' }).success).toBe(false);
  });

  it('rejeita nome vazio ou demasiado curto', () => {
    expect(registrationSchema.safeParse({ email: 'maria@cts.angola', name: 'M', password: 'segredo123' }).success).toBe(false);
  });

  it('rejeita palavra-passe com menos de 8 caracteres', () => {
    expect(registrationSchema.safeParse({ email: 'maria@cts.angola', name: 'Maria', password: 'curta1' }).success).toBe(false);
    expect(passwordProblem('curta1')).toContain('8 caracteres');
  });

  it('aceita uma palavra-passe válida', () => {
    expect(registrationSchema.safeParse({ email: 'maria@cts.angola', name: 'Maria Silva', password: 'segredo123' }).success).toBe(true);
    expect(passwordProblem('segredo123')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/registration.test.ts`
Expected: FAIL — "Cannot find module './registration'".

- [ ] **Step 3: Implement `src/lib/registration.ts`**

`z.object({ email: z.string().trim().email().max(190), name: z.string().trim().min(2).max(80), password: z.string().min(8).max(128) })`, `normalizeEmail` e `passwordProblem` conforme as assinaturas acima.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/registration.test.ts`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/registration.ts src/lib/registration.test.ts
git commit -m "feat: regras de validação do registo de formando"
```

---

### Task 2: Action `registerStudent` (cria a conta na BD)

**Files:**
- Create: `src/actions/registration.ts`
- Modify: `src/lib/registration.ts` (exportar também as mensagens de erro usadas pela action, seMakes sentido — a action pode ter as suas)

**Interfaces:**
- Consumes: `registrationSchema`, `normalizeEmail` de `src/lib/registration.ts`; `hashPassword` de `src/lib/password.ts`; `audit` de `src/lib/audit.ts`; `prisma` de `@/lib/prisma`; `signIn` de `@/lib/auth`; `auth` de `@/lib/auth` (só para sessão posterior).
- Produces:
  - `export type RegistrationState = { status: 'ok' } | { status: 'error'; message: string; field?: 'email' | 'name' | 'password' } | null`
  - `export async function registerStudent(prev: RegistrationState, formData: FormData): Promise<RegistrationState>` — 'use server'. Ao sucesso: `{ status: 'ok' }` **e** sessão iniciada no servidor.

- [ ] **Step 1: Write the failing test**

Teste de integração contra a BD (script Playwright está no Task 6; aqui a verificação é manual via consola). Escrever em `src/actions/registration.test.ts` apenas a parte testável sem BD — não é possível testar a action com Prisma sem mock; **logo, esta task não tem teste unitário próprio**: a verificação é o teste manual documentado no Step 4 e o teste end-to-end do Task 6.

Registar no ficheiro de plano: "Sem teste unitário (Prisma); a prova é o e2e do Task 6."

- [ ] **Step 2: Verificar que a action ainda não existe**

Run: `npx tsc --noEmit` após criar o ficheiro só com o esqueleto — ou, mais simples, confirmar que `src/actions/registration.ts` ainda não existe:
Run: `Test-Path "src/actions/registration.ts"` → Expected: `False`.

- [ ] **Step 3: Implement `src/actions/registration.ts`**

Regras exactas de implementação:

1. `'use server'` no topo.
2. `detectLocale(value)` local: `'en'` se o valor for `'en'`, senão `'pt'` (mesmo padrão de `src/actions/contact.ts:34-36`).
3. Ler `email`, `name`, `password`, `locale` do `formData`.
4. `const h = await headers();` → `ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown'`; `ipHash = createHash('sha256').update(`${ip}:${process.env.AUTH_SECRET ?? 'dev'}`).digest('hex')`.
5. Limite persistente: contar em `prisma.auditLog` as entradas `action: 'user.register'` criadas nas últimas 24 h cujo `metadata` tenha `ipHash` igual (`metadata: { path: ['ipHash'], equals: ipHash }`) e, em separado, as entradas com `metadata.email` igual ao email normalizado. Se qualquer uma das contagens >= 5 → devolver `{ status: 'error', message: MESSAGES[locale].rateLimit }` **antes** de criar o utilizador.
6. Validar com `registrationSchema.safeParse({ email, name, password })`. Em caso de falha, devolver `{ status: 'error', message: <mensagem por campo>, field: <campo> }` usando `parsed.error.issues[0].path[0]`.
7. `const existing = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });` → se existir, devolver `{ status: 'error', message: MESSAGES[locale].emailTaken, field: 'email' }` (mensagem genérica, não revela o papel).
8. Criar o utilizador: `prisma.user.create({ data: { email: normalizeEmail(email), name: name.trim(), passwordHash: await hashPassword(password), role: 'STUDENT', locale } })`.
9. `await audit({ action: 'user.register', entity: 'user', entityId: user.id, metadata: { ipHash, email: user.email }, ip, userAgent: h.get('user-agent')?.slice(0, 300) });`
10. Iniciar sessão no servidor: `await signIn('credentials', { email: user.email, password, redirect: false });` (importado de `@/lib/auth`). Se o `signIn` lançar, devolver `{ status: 'error', message: MESSAGES[locale].generic }` — o utilizador já fica criado na BD.
11. Devolver `{ status: 'ok' }`.

`MESSAGES` (constante local, PT/EN):

```ts
const MESSAGES = {
  pt: {
    emailTaken: 'Esse email já tem conta. Use "Já tenho conta" para entrar.',
    emailInvalid: 'O e-mail indicado não é válido.',
    nameInvalid: 'Indique o seu nome (2 a 80 caracteres).',
    passwordInvalid: 'A palavra-passe precisa de pelo menos 8 caracteres.',
    rateLimit: 'Demasiadas tentativas de registo. Tente novamente mais tarde.',
    generic: 'Não foi possível criar a conta. Tente novamente.',
  },
  en: {
    emailTaken: 'This email already has an account. Use "I already have an account" to sign in.',
    emailInvalid: 'The email address is invalid.',
    nameInvalid: 'Enter your name (2 to 80 characters).',
    passwordInvalid: 'The password needs at least 8 characters.',
    rateLimit: 'Too many registration attempts. Please try again later.',
    generic: 'Could not create the account. Please try again.',
  },
} as const;
```

- [ ] **Step 4: Verificar manualmente**

Run: `npx tsc --noEmit` → Expected: exit 0, sem erros.
Run: `npx biome check src/actions/registration.ts src/lib/registration.ts` → Expected: sem erros (ou aplicar `npx biome check --write` se apontar formatação).

- [ ] **Step 5: Commit**

```bash
git add src/actions/registration.ts
git commit -m "feat: action de registo de formando com limite persistente"
```

---

### Task 3: Action `enrollInCourse` (inscrição na BD)

**Files:**
- Modify: `src/actions/registration.ts` (adicionar a action ao mesmo ficheiro)

**Interfaces:**
- Consumes: `prisma`, `audit`, `auth` (de `@/lib/auth`) — a action exige sessão.
- Produces:
  - `export async function enrollInCourse(prev: RegistrationState, formData: FormData): Promise<RegistrationState>` — cria a inscrição e **redirecciona** para `/{locale}/aluno`.

- [ ] **Step 1: Verificar que a action ainda não existe**

Run: `rg -n "enrollInCourse" src` → Expected: sem resultados.

- [ ] **Step 2: Implementar `enrollInCourse` em `src/actions/registration.ts`**

Regras exactas:

1. `const session = await auth();` → se `!session?.user?.id`, devolver `{ status: 'error', message: MESSAGES[locale].signInRequired }` (PT: `'Inicie sessão para confirmar a inscrição.'`; EN: `'Sign in to confirm your enrolment.'`).
2. `const courseId = String(formData.get('courseId') ?? '');` — se vazio → `{ status: 'error', message: MESSAGES[locale].generic }`.
3. `const course = await prisma.course.findFirst({ where: { id: courseId, published: true } });` → se não existir, devolver `{ status: 'error', message: MESSAGES[locale].courseUnavailable }` (PT: `'Esta formação já não está disponível para inscrição.'`; EN: `'This programme is no longer open for enrolment.'`). **Esta verificação cobre o Review Focus #4.**
4. `await prisma.enrollment.upsert({ where: { userId_courseId: { userId: session.user.id, courseId } }, update: {}, create: { userId: session.user.id, courseId, status: 'PENDING' } });`
5. `await audit({ action: 'enrollment.create', entity: 'enrollment', entityId: courseId, metadata: { courseId, userId: session.user.id } });`
6. `redirect(`/${locale}/aluno`);` — **fora** de qualquer `try/catch` (o `redirect` do Next.js lança `NEXT_REDIRECT`).

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit` → Expected: exit 0.
Run: `npx biome check src/actions/registration.ts` → Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/actions/registration.ts
git commit -m "feat: action de inscricao em curso"
```

---

### Task 4: Panfletos lidos da BD, com descrição no hover

**Files:**
- Modify: `src/lib/content-db.ts` (linhas 56-89)
- Modify: `src/components/views/training-view.tsx` (linhas 11-24 e 175-209)

**Interfaces:**
- Consumes: `getPublicCourses()` já existente.
- Produces:
  - `PublicCourse` passa a incluir `brochureUrl: string | null` (campo novo no tipo, lido de `row.brochureUrl`).
  - `export function coursePath(locale: Locale, slug: string): string` em `src/lib/site.ts` → `/${locale}/${locale === 'pt' ? 'formacao' : 'training'}/${slug}`.

- [ ] **Step 1: Escrever o teste falhado (tipo do conteúdo)**

`src/lib/content-db.test.ts` não é viável (Prisma). A verificação é de tipos + render. Em vez de teste unitário, fixar o comportamento com um teste Playwright no Task 6 (hover mostra a descrição; o link do panfleto vai para a página do curso).

- [ ] **Step 2: Adicionar `brochureUrl` ao tipo e ao mapper em `src/lib/content-db.ts`**

```ts
export type PublicCourse = {
  // ... campos existentes
  brochureUrl: string | null;
};
```
e no `return rows.map(...)`: `brochureUrl: row.brochureUrl,`.

- [ ] **Step 3: Adicionar `coursePath` em `src/lib/site.ts`**

```ts
export function coursePath(locale: Locale, slug: string): string {
  return `/${locale}/${locale === 'pt' ? 'formacao' : 'training'}/${slug}`;
}
```

- [ ] **Step 4: Substituir a constante `FLYERS` por dados da BD em `training-view.tsx`**

- Apagar a constante `FLYERS` (linhas 11-24).
- Na secção "Panfletos oficiais" (linhas 175-209), iterar `courses` (já disponível na linha 28) em vez de `FLYERS`; cada panfleto é um `<article>` com:
  - `<Link href={coursePath(locale, course.slug)}>` a envolver a imagem (`course.imageUrl`), `aspect-3/4`, `object-cover`;
  - overlay sobre a imagem: `absolute inset-0 bg-ink/85 p-5 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100` com nível, título, duração, preço e **descrição** (`course.summary[locale]`, com `line-clamp-3`);
  - fora do overlay (visível sempre, para mobile e para quem não faz hover): título e descrição em texto normal por baixo da imagem — no desktop o overlay repete o texto, o que é aceitável e garante acessibilidade;
  - botão "Inscrever-se" dentro do overlay e link "Ver panfleto" no texto de baixo.
- A secção "Cursos publicados" (linhas 102-173) mantém os cards, mas o link "Inscrever-se" (linhas 158-164) passa de `${localePath(locale, 'contact')}#contacto` para `coursePath(locale, course.slug)`.
- Se `courses` estiver vazio (BD indisponível), manter a secção de panfletos **oculta** (não renderizar a grelha) e mostrar apenas a mensagem de "Cursos publicados" já existente.

- [ ] **Step 5: Verificar**

Run: `npx biome check src/components/views/training-view.tsx src/lib/content-db.ts src/lib/site.ts` → Expected: sem erros.
Run: `npm run typecheck` → Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/views/training-view.tsx src/lib/content-db.ts src/lib/site.ts
git commit -m "feat: panfletos lidos da base de dados com descricao no hover"
```

---

### Task 5: Página do curso + painel de inscrição

**Files:**
- Create: `src/components/views/course-detail-view.tsx`
- Create: `src/components/training/enroll-panel.tsx` (`'use client'`)
- Modify: `src/app/[locale]/(public)/[section]/[slug]/page.tsx` (linhas 33-44)

**Interfaces:**
- Consumes: `getPublicCourses()`, `coursePath`, `registerStudent`, `enrollInCourse`, `checkCredentials` (de `@/actions/auth`), `signIn` (de `next-auth/react`).
- Produces:
  - `export function CourseDetailView({ locale, slug, courses }: { locale: 'pt' | 'en'; slug: string; courses: PublicCourse[] })`
  - `export function EnrollPanel({ locale, course, isSignedIn }: { locale: 'pt' | 'en'; course: PublicCourse; isSignedIn: boolean })`

- [ ] **Step 1: Verificar que os ficheiros ainda não existem**

Run: `Test-Path "src/components/views/course-detail-view.tsx"` → Expected: `False`.

- [ ] **Step 2: Criar `src/components/views/course-detail-view.tsx`**

Estrutura:
- localizar o curso por `slug` em `courses`; se não existir → `return null` (o page.tsx chama `notFound()` antes);
- `PageHero` com `eyebrow = course.level ?? course.family`, `title = course.title[locale]`, `lede = course.summary[locale]`;
- secção principal com o panfleto grande (`course.imageUrl`, `aspect-3/4`) e, ao lado, uma ficha com nível, duração, preço (só os que existirem) e o `<EnrollPanel>`;
- link "Voltar à formação" → `sectionPath(locale, 'training')`;
- botão secundário "Pedir informação" → `${sectionPath(locale, 'contact')}#contacto`.

- [ ] **Step 3: Criar `src/components/training/enroll-panel.tsx`**

Comportamento:
- Se `isSignedIn` é `false`: mostrar os dois separadores "Criar conta" e "Já tenho conta".
  - "Criar conta": `<form action={registerAction}>` com `useActionState` (React 19) sobre `registerStudent`; campos `email`, `name`, `password`; `locale` em `<input type="hidden" name="locale" value={locale} />`; mensagem de erro com `state.field` a destacar o campo; ao receber `{ status: 'ok' }` → `router.refresh()` e `router.push(`/${locale}/aluno`)`; botão desabilitado enquanto `pending`.
  - "Já tenho conta": formulário com `email` + `password`; chamar `checkCredentials({ email, password })` de `@/actions/auth`; se devolver `'mfa'` mostrar o campo de código TOTP; depois `signIn('credentials', { email, password, totp, redirect: false })` de `next-auth/react`; em sucesso → `router.refresh()`. **Reaproveitar o padrão de `src/app/[locale]/aluno/login/student-login-form.tsx`**, incluindo `rate_limited` e mensagens de erro.
- Se `isSignedIn` é `true`: mostrar o botão "Confirmar inscrição" com `<form action={enrollAction}>` e `useActionState` sobre `enrollInCourse`; campo oculto `courseId` e `locale`; ao erro mostrar a mensagem; ao sucesso a action faz `redirect` para `/{locale}/aluno`.
- Estilo: `card p-6` com `border border-border bg-surface`; usar as classes `btn-primary`, `btn-outline`, `input`/classes já usadas nos formulários de login (`FIELD_CLASS` de `student-login-form.tsx`).

- [ ] **Step 4: Ligar a rota em `src/app/[locale]/(public)/[section]/[slug]/page.tsx`**

- Em `generateMetadata`: se `resolveSection(locale, section) === 'training'`, procurar o curso por `slug` em `getPublicCourses()` e devolver `{ title: course.title[locale], description: course.summary[locale] }`; caso contrário manter o comportamento dos serviços.
- No componente principal: `const key = resolveSection(locale, section);` → se `key === 'services'` manter o código actual; se `key === 'training'`:
  ```ts
  const list = await getPublicCourses();
  const course = list.find((c) => c.slug === slug);
  if (!course) notFound();
  setRequestLocale(locale);
  const session = await auth();
  return <CourseDetailView locale={locale} slug={slug} courses={list} />;
  ```
  (`isSignedIn` é resolvido dentro do `EnrollPanel` via `useSession()` de `next-auth/react`, para não duplicar a lógica de sessão no servidor — **decisão**: passar `isSignedIn` como prop obtida no servidor com `auth()`, que é mais fiável em server components.)
- Importar `auth` de `@/lib/auth` e `CourseDetailView`.
- Actualizar o comentário `/** Apenas os serviços têm páginas de detalhe. */` → `/** Serviços e formações têm páginas de detalhe. */`.

- [ ] **Step 5: Verificar**

Run: `npx biome check src/components/views/course-detail-view.tsx src/components/training/enroll-panel.tsx "src/app/[locale]/(public)/[section]/[slug]/page.tsx"` → Expected: sem erros.
Run: `npm run typecheck` → Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/views/course-detail-view.tsx src/components/training/enroll-panel.tsx "src/app/[locale]/(public)/[section]/[slug]/page.tsx"
git commit -m "feat: pagina do curso com painel de inscricao e criacao de conta"
```

---

### Task 6: Verificação end-to-end, qualidade e deploy

**Files:**
- Create (temporário, não versionar): `tmp-e2e-step1.py` (script Playwright), removido no fim da task.

**Interfaces:**
- Consumes: tudo o que as Tasks 1-5 produzem.
- Produces: nada em código — é a prova de que o passo funciona.

- [ ] **Step 1: Arrancar o dev server**

Run (se não estiver a correr): `Start-Process -FilePath "cmd.exe" -ArgumentList "/c","npm run dev > dev.log 2>&1" -WorkingDirectory (Get-Location).Path -WindowStyle Hidden`
Expected: `http://localhost:3000/pt` responde 200.

- [ ] **Step 2: Escrever o script Playwright**

`tmp-e2e-step1.py` (Playwright Python, como os scripts anteriores desta sessão):
1. abrir `http://localhost:3000/pt/formacao`;
2. localizar o primeiro card de panfleto (`article` dentro da secção de panfletos), fazer `hover` e verificar que a descrição do curso aparece visível;
3. clicar no panfleto → verificar que a URL é `/{locale}/formacao/{slug}`;
4. preencher "Criar conta" com email único (`formando.teste.<timestamp>@cts.test`), nome e senha;
5. submeter → verificar que chega a `/{locale}/aluno` e que o curso aparece na lista;
6. voltar a `/{locale}/formacao`, repetir o registo **com o mesmo email** → verificar que a mensagem é "Esse email já tem conta..." (sem 500);
7. entrar em "Já tenho conta" com o email criado → verificar que a sessão fica activa e o painel passa a "Confirmar inscrição";
8. confirmar a inscrição → verificar que o estado é "Aguarda pagamento";
9. recolher erros de consola (`pageerror` e `console` tipo `error`) → não pode haver nenhum.

- [ ] **Step 3: Correr o script**

Run: `python tmp-e2e-step1.py`
Expected: imprime "STEP1 E2E OK" e sai com código 0.

- [ ] **Step 4: Correr a suite completa**

Run: `npx biome check .` → Expected: sem erros.
Run: `npm run typecheck` → Expected: exit 0.
Run: `npx vitest run` → Expected: todos os testes a passar (14 existentes + 5 novos de `registration.test.ts`).
Run (com o dev server parado): `npm run build` → Expected: exit 0 e a rota `/{locale}/formacao/[slug]` na tabela de rotas.

- [ ] **Step 5: Capturas de ecrã**

Guardar em `docs/assets/`: `step1-panfleto-hover.png`, `step1-pagina-curso.png`, `step1-criar-conta.png`, `step1-area-formando.png`.

- [ ] **Step 6: Limpar e fazer deploy**

- `Remove-Item tmp-e2e-step1.py -Force`
- Parar o dev server, `npm run build` (exit 0), `vercel --prod --yes`.
- Verificar em produção: `https://cts-consultoria.vercel.app/pt/formacao` (hover + link), `.../pt/formacao/{slug}` (registo) e `.../pt/aluno`.

- [ ] **Step 7: Commit**

```bash
git add docs/assets/step1-*.png
git commit -m "test: evidencias do passo 1 (panfletos, registo e inscricao)"
```
