import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/scroll/reveal';
import { EnrollPanel } from '@/components/training/enroll-panel';
import type { PublicCourse } from '@/lib/content-db';
import { sectionPath } from '@/lib/site';
import { ArrowLeft, CalendarDays, GraduationCap, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  locale: 'pt' | 'en';
  course: PublicCourse;
  isSignedIn: boolean;
};

export function CourseDetailView({ locale, course, isSignedIn }: Props) {
  const isPt = locale === 'pt';

  return (
    <>
      <PageHero
        eyebrow={course.level ?? course.family}
        title={course.title[locale]}
        lede={course.summary[locale]}
        aside={
          <div className="rounded-xl border border-border bg-surface-muted px-7 py-6">
            <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-accent-600">
              {course.level ?? course.family}
            </p>
            <Link href={sectionPath(locale, 'training')} className="link-underline mt-4 text-sm">
              <ArrowLeft size={15} />
              {isPt ? 'Todos os cursos' : 'All courses'}
            </Link>
          </div>
        }
      />

      <section className="section-y bg-surface">
        <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
              <div className="relative aspect-3/4">
                <Image
                  src={course.imageUrl ?? course.brochureUrl ?? '/training/flyer-1.jpg'}
                  alt={`${course.title[locale]} — panfleto CTS Academia`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-7">
              <dl className="grid gap-4 sm:grid-cols-3">
                <div className="card p-5">
                  <dt className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    <GraduationCap size={15} className="text-primary-600" />
                    {isPt ? 'Nível' : 'Level'}
                  </dt>
                  <dd className="mt-2 font-display text-base font-semibold text-ink">
                    {course.level ?? course.family}
                  </dd>
                </div>
                {course.duration ? (
                  <div className="card p-5">
                    <dt className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      <CalendarDays size={15} className="text-primary-600" />
                      {isPt ? 'Duração' : 'Duration'}
                    </dt>
                    <dd className="mt-2 font-display text-base font-semibold text-ink">
                      {course.duration}
                    </dd>
                  </div>
                ) : null}
                {course.price ? (
                  <div className="card p-5">
                    <dt className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      <Wallet size={15} className="text-primary-600" />
                      {isPt ? 'Investimento' : 'Fee'}
                    </dt>
                    <dd className="mt-2 font-display text-base font-semibold text-ink">
                      {course.price}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div>
                <h2 className="heading-md">{isPt ? 'Sobre esta formação' : 'About this course'}</h2>
                <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                  {course.summary[locale]}
                </p>
              </div>

              <EnrollPanel locale={locale} course={course} isSignedIn={isSignedIn} />

              <Link
                href={`${sectionPath(locale, 'contact')}#contacto`}
                className="btn-outline w-full sm:w-auto"
              >
                {isPt ? 'Pedir informação' : 'Request information'}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
