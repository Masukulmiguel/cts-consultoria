import { AdminShell } from '@/components/admin/admin-shell';
import { ADMIN_NAV } from '@/lib/admin/nav';
import { signOut } from '@/lib/auth';
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

  if (locale !== 'pt') redirect('/pt/admin');

  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof AuthError) redirect('/pt/admin/login');
    throw err;
  }

  return (
    <AdminShell
      user={{ name: user.name ?? user.email, email: user.email, role: user.role }}
      groups={ADMIN_NAV}
      signOutAction={async () => {
        'use server';
        await signOut({ redirectTo: '/pt/admin/login' });
      }}
    >
      {children}
    </AdminShell>
  );
}
