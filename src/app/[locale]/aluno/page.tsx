import { signOutAction } from '@/actions/auth-signout';
import type { Locale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Award, BookOpen, CalendarCheck, FileText, LogOut } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Aguarda pagamento', className: 'bg-warning-bg text-warning' },
  PAID: { label: 'Pago', className: 'bg-info-bg text-info' },
  CONFIRMED: { label: 'Confirmada', className: 'bg-success-bg text-success' },
  COMPLETED: { label: 'Concluída', className: 'bg-success-bg text-success' },
  CANCELLED: { label: 'Cancelada', className: 'bg-error-bg text-error' },
};

export default async function StudentAreaPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isPt = locale === 'pt';

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect(`/${locale}/aluno/login`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: { include: { materials: { where: { published: true }, orderBy: { order: 'asc' } } } },
      attendances: { orderBy: { date: 'desc' } },
      certificates: { orderBy: { issuedAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="on-dark bg-ink">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-8">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[0.24em] text-accent-300">
              CTS Academia
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-white">
              {isPt ? 'Área do formando' : 'Student area'}
            </h1>
            <p className="mt-1 text-sm text-white/60">{user?.name ?? user?.email}</p>
          </div>
          <form action={signOutAction}>
            <input type="hidden" name="callbackUrl" value={`/${locale}`} />
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/25 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <LogOut size={16} />
              {isPt ? 'Sair' : 'Sign out'}
            </button>
          </form>
        </div>
      </div>

      <div className="shell py-14">
        {enrollments.length === 0 ? (
          <div className="card mx-auto max-w-xl p-9 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <BookOpen size={22} />
            </span>
            <h2 className="mt-5 font-display text-xl font-semibold text-ink">
              {isPt ? 'Ainda não tem inscrições' : 'No enrolments yet'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              {isPt
                ? 'Assim que a CTS confirmar a sua inscrição, os materiais, as presenças e os certificados ficam disponíveis aqui.'
                : 'Once CTS confirms your enrolment, materials, attendance and certificates will be available here.'}
            </p>
            <Link href={`/${locale}/formacao`} className="btn-primary mt-7">
              {isPt ? 'Ver formação' : 'View training'}
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {enrollments.map((enrollment) => {
              const status = STATUS[enrollment.status] ?? STATUS.PENDING;
              const present = enrollment.attendances.filter((item) => item.present).length;
              const progress = Math.min(Math.max(enrollment.progress, 0), 100);

              return (
                <article key={enrollment.id} className="card overflow-hidden">
                  <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="p-7 lg:p-9">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex rounded-pill px-3 py-1 text-2xs font-semibold uppercase tracking-[0.14em] ${status.className}`}
                        >
                          {status.label}
                        </span>
                        {enrollment.course.level ? (
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            {enrollment.course.level}
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                        {enrollment.course.title}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                        {enrollment.course.summary}
                      </p>

                      <div className="mt-7">
                        <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
                          <span>{isPt ? 'Progresso' : 'Progress'}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-surface-subtle">
                          <div
                            className="h-full rounded-pill bg-primary-600 transition-[width] duration-500 ease-cts-enter"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <dl className="mt-7 grid gap-4 sm:grid-cols-2">
                        <div className="flex items-start gap-3">
                          <CalendarCheck size={18} className="mt-0.5 shrink-0 text-primary-600" />
                          <div>
                            <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                              {isPt ? 'Presenças' : 'Attendance'}
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-ink">
                              {present} / {enrollment.attendances.length}
                            </dd>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Award size={18} className="mt-0.5 shrink-0 text-primary-600" />
                          <div>
                            <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                              {isPt ? 'Certificados' : 'Certificates'}
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-ink">
                              {enrollment.certificates.length}
                            </dd>
                          </div>
                        </div>
                      </dl>
                    </div>

                    <div className="border-t border-border bg-surface p-7 lg:border-t-0 lg:border-l lg:p-9">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                        {isPt ? 'Materiais do curso' : 'Course materials'}
                      </p>
                      {enrollment.course.materials.length === 0 ? (
                        <p className="mt-4 text-sm text-ink-secondary">
                          {isPt
                            ? 'Os materiais serão disponibilizados pela equipa formadora.'
                            : 'Materials will be made available by the training team.'}
                        </p>
                      ) : (
                        <ul className="mt-4 space-y-2.5">
                          {enrollment.course.materials.map((material) => (
                            <li key={material.id}>
                              <a
                                href={material.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-md border border-border px-3.5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-primary-300 hover:text-primary-700"
                              >
                                <FileText size={16} className="shrink-0 text-primary-600" />
                                <span className="flex-1">{material.title}</span>
                                <span className="text-2xs uppercase tracking-[0.14em] text-ink-muted">
                                  {material.type}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}

                      {enrollment.certificates.length > 0 ? (
                        <div className="mt-7 border-t border-border pt-6">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                            {isPt ? 'Certificados emitidos' : 'Issued certificates'}
                          </p>
                          <ul className="mt-3 space-y-2">
                            {enrollment.certificates.map((certificate) => (
                              <li key={certificate.id} className="text-sm text-ink-secondary">
                                <span className="font-semibold text-ink">{certificate.code}</span> ·{' '}
                                {certificate.issuedAt.toLocaleDateString(isPt ? 'pt-PT' : 'en-GB')}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
