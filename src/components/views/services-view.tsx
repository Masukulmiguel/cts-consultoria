import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/scroll/reveal';
import { TiltCard } from '@/components/scroll/tilt-card';
import { services } from '@/content/services';
import { localePath } from '@/lib/site';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function ServicesView({ locale }: { locale: 'pt' | 'en' }) {
  const isPt = locale === 'pt';

  return (
    <>
      <PageHero
        eyebrow={isPt ? 'Soluções empresariais' : 'Business solutions'}
        title={isPt ? 'Serviços especializados de consultoria' : 'Specialized consulting services'}
        lede={
          isPt
            ? 'Apoiamos empresas em Angola a elevar o padrão de governança, mitigar riscos fiscais perante a AGT e otimizar a tomada de decisão financeira.'
            : 'We support companies in Angola to raise governance standards, mitigate tax risks before the AGT and optimize financial decision-making.'
        }
      />

      <section className="section-y bg-surface-muted">
        <div className="shell">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.slug[locale]} delay={index * 0.04}>
                <TiltCard className="h-full">
                  <Link
                    href={`${localePath(locale, 'services')}/${service.slug[locale]}`}
                    className="card card-hover group flex h-full flex-col p-7"
                  >
                    <div className="flex items-center justify-end gap-3">
                      <span className="inline-flex rounded-pill bg-primary-50 px-3 py-1 text-2xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                        {service.category[locale]}
                      </span>
                    </div>

                    <h2 className="mt-5 font-display text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700">
                      {service.title[locale]}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                      {service.summary[locale]}
                    </p>

                    <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                      {service.bullets.map((bullet) => (
                        <li key={bullet.pt} className="flex gap-2.5 text-sm text-ink-secondary">
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary-600" />
                          <span>{bullet[locale]}</span>
                        </li>
                      ))}
                    </ul>

                    <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                      {isPt ? 'Saber mais' : 'Learn more'}
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="shell">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-ink px-8 py-14 text-center text-white sm:px-14 lg:py-20">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 10%, rgba(0,84,174,0.55), transparent 50%)',
                }}
                aria-hidden
              />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight">
                  {isPt
                    ? 'Precisa de um diagnóstico contábil ou fiscal para a sua empresa?'
                    : 'Do you need an accounting or tax assessment for your company?'}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-white/75">
                  {isPt
                    ? 'Descreva o seu desafio e os nossos consultores propõem o caminho mais seguro.'
                    : 'Describe your challenge and our consultants will propose the safest path.'}
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <Link href={`${localePath(locale, 'contact')}#contacto`} className="btn-accent">
                    {isPt ? 'Pedir diagnóstico' : 'Request an assessment'}
                    <ArrowRight size={17} />
                  </Link>
                  <Link href={localePath(locale, 'training')} className="btn-ghost-dark">
                    {isPt ? 'Ver formação' : 'View training'}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
