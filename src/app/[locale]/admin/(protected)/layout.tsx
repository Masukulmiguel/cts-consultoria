import { auth } from '@/lib/auth';
import { AuthError, requireUser } from '@/lib/rbac';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // O painel é apenas em pt-PT na fase inicial (decisão D2, docs/23).
  if (locale !== 'pt') redirect('/pt/admin');

  try {
    await requireUser();
  } catch (err) {
    if (err instanceof AuthError) redirect('/pt/admin/login');
    throw err;
  }

  // Garante que a sessão veio mesmo do Auth.js
  const session = await auth();
  if (!session?.user) redirect('/pt/admin/login');

  return <div className="min-h-screen bg-surface">{children}</div>;
}
