import { signOut } from '@/lib/auth';
import { requireUser } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Painel administrativo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sessão iniciada como <strong>{user.name}</strong> ({user.role})
          </p>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/pt/admin/login' });
          }}
        >
          <button
            type="submit"
            className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Terminar sessão
          </button>
        </form>
      </div>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold">Estado da fundação técnica</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-600">
          <li>Autenticação com sessões JWT (8 h) e revogação por sessionVersion</li>
          <li>MFA TOTP disponível para administradores</li>
          <li>RBAC verificado no servidor (src/lib/rbac.ts)</li>
          <li>Auditoria de login em AuditLog</li>
          <li>Rate limiting no login (5 tentativas / 5 min)</li>
        </ul>
        <p className="mt-4 text-sm text-gray-400">
          Os módulos de conteúdos, cursos, inscrições e pagamentos serão adicionados nas fases 5–7.
        </p>
      </section>
    </main>
  );
}
