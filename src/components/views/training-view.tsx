import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/scroll/reveal';
import { TiltCard } from '@/components/scroll/tilt-card';
import { trainingFamilies } from '@/content/services';
import { getPublicCourses } from '@/lib/content-db';
import { coursePath, localePath } from '@/lib/site';
import { ArrowRight, Award, CheckCircle2, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export async function TrainingView({ locale }: { locale: 'pt' | 'en' }) {
  const isPt = locale === 'pt';
  const courses = await getPublicCourses();

  return (
    <>
      <PageHero
        eyebrow="CTS Academia"
        title={isPt ? 'Formação profissional' : 'Professional training'}
        lede={
          isPt
            ? 'Formação prática em contabilidade, fiscalidade e software de gestão, com certificados homologados pelo INEFOP e estágios profissionais.'
            : 'Practical training in accounting, tax and management software, with INEFOP-homologated certificates and professional internships.'
        }
        aside={
          <ul className="space-y-3 rounded-xl border border-border bg-surface-muted px-7 py-6">
            {[
              {
                icon: Award,
                label: isPt
                  ? 'Certificados homologados pelo INEFOP'
                  : 'INEFOP-homologated certificates',
              },
              {
                icon: GraduationCap,
                label: isPt
                  ? 'Estágios profissionais disponíveis'
                  : 'Professional internships available',
              },
              {
                icon: CheckCircle2,
                label: isPt
                  ? 'Formação em Primavera v10 e Portal AGT'
                  : 'Primavera v10 and AGT Portal training',
              },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-3 text-sm font-medium text-ink">
                <item.icon size={17} className="mt-0.5 shrink-0 text-primary-600" />
                {item.label}
              </li>
            ))}
          </ul>
        }
      />

      <section className="section-y bg-surface-muted">
        <div className="shell">
          <Reveal>
            <p className="eyebrow">{isPt ? 'Áreas de formação' : 'Training areas'}</p>
            <h2 className="heading-lg mt-5 max-w-2xl">
              {isPt
                ? 'Três percursos que ligam a sala de aula ao trabalho real'
                : 'Three pathways that connect the classroom to real work'}
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {trainingFamilies.map((family, index) => (
              <Reveal key={family.title.pt} delay={index * 0.06}>
                <article className="card card-hover h-full p-7">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <GraduationCap size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold leading-snug text-ink">
                    {family.title[locale]}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                    {family.description[locale]}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {courses.length > 0 ? (
        <section className="section-y bg-surface">
          <div className="shell">
            <Reveal>
              <p className="eyebrow">{isPt ? 'Panfletos oficiais' : 'Official flyers'}</p>
              <h2 className="heading-lg mt-5 max-w-2xl">
                {isPt
                  ? 'Programas publicados pela CTS Academia'
                  : 'Programmes published by CTS Academy'}
              </h2>
              <p className="lede mt-5">
                {isPt
                  ? 'Passe o rato sobre um panfleto para ver a descrição, ou inscreva-se directamente no curso.'
                  : 'Hover a flyer to read the description, or enrol directly in the programme.'}
              </p>
            </Reveal>

            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {courses.map((course, index) => (
                <Reveal key={course.id} delay={Math.min(index * 0.02, 0.2)}>
                  <article className="group overflow-hidden rounded-lg border border-border bg-surface shadow-xs transition duration-200 ease-cts-enter hover:-translate-y-1 hover:shadow-lg">
                    <Link href={coursePath(locale, course.slug)} className="block">
                      <div className="relative aspect-3/4 overflow-hidden bg-surface-muted">
                        <Image
                          src={course.imageUrl ?? course.brochureUrl ?? '/training/flyer-1.jpg'}
                          alt={`${course.title[locale]} — panfleto CTS Academia`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/95 via-ink/85 to-ink/45 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                        >
                          <span className="text-2xs font-semibold uppercase tracking-[0.14em] text-accent-300">
                            {course.level ?? course.family}
                          </span>
                          <h3 className="mt-1.5 font-display text-sm font-semibold leading-snug">
                            {course.title[locale]}
                          </h3>
                          <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-white/85">
                            {course.summary[locale]}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-300">
                            {isPt ? 'Inscrever-se' : 'Enrol now'}
                            <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <span className="text-2xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                          {course.level ?? course.family}
                        </span>
                        <h3 className="mt-1.5 font-display text-sm font-semibold leading-snug text-ink">
                          {course.title[locale]}
                        </h3>
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink-secondary">
                          {course.summary[locale]}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-700">
                          {isPt ? 'Inscrever-se' : 'Enrol now'}
                          <ArrowRight size={13} />
                        </span>
                      </div>
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-y border-t border-border bg-surface-muted">
        <div className="shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal>
            <p className="eyebrow">{isPt ? 'Próximas edições' : 'Upcoming editions'}</p>
            <h2 className="heading-lg mt-5">
              {isPt
                ? 'Datas, vagas e investimentos serão publicados aqui'
                : 'Dates, seats and fees will be published here'}
            </h2>
            <p className="lede mt-5">
              {isPt
                ? 'Contacte-nos para receber aviso de abertura de inscrições e reservar a sua vaga nas próximas formações.'
                : 'Contact us to be notified when enrolments open and to reserve your seat in the next sessions.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`${localePath(locale, 'contact')}#contacto`} className="btn-primary">
                {isPt ? 'Ser avisado das inscrições' : 'Notify me about enrolments'}
                <ArrowRight size={17} />
              </Link>
              <Link href={localePath(locale, 'services')} className="btn-outline">
                {isPt ? 'Ver serviços' : 'View services'}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <TiltCard className="w-full" max={2}>
              <figure className="overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
                <div className="relative aspect-4/3">
                  <Image
                    src="/gallery/sala-de-formacao.jpg"
                    alt={
                      isPt
                        ? 'Sala de formação CTS com formador e participantes a trabalhar em portáteis.'
                        : 'CTS training room with a trainer and participants working on laptops.'
                    }
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                </div>
              </figure>
            </TiltCard>
          </Reveal>
        </div>
      </section>
    </>
  );
}
