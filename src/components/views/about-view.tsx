import { PageHero } from '@/components/page-hero';
import { ParallaxLayer } from '@/components/scroll/parallax-layer';
import { Reveal } from '@/components/scroll/reveal';
import { TiltCard } from '@/components/scroll/tilt-card';
import { about, anpg, company, facts, mission, taglineLong } from '@/content/services';
import { localePath } from '@/lib/site';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const PARTNERS = [
  {
    src: '/partners/inefop.png',
    alt: 'INEFOP — Instituto Nacional de Emprego e Formação Profissional',
  },
  { src: '/partners/anpg.png', alt: 'ANPG — Agência Nacional de Petróleos e Gás' },
  { src: '/partners/agt.png', alt: 'AGT — Administração Geral Tributária' },
];

export function AboutView({ locale }: { locale: 'pt' | 'en' }) {
  const isPt = locale === 'pt';

  return (
    <>
      <PageHero
        eyebrow={isPt ? 'Institucional' : 'Corporate'}
        title={about.title[locale]}
        lede={taglineLong[locale]}
        aside={
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 rounded-xl border border-border bg-surface-muted px-7 py-6">
            {facts.map((fact) => (
              <div key={fact.label.pt}>
                <dt className="text-2xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  {fact.label[locale]}
                </dt>
                <dd className="mt-1 font-display text-base font-semibold text-ink">
                  {fact.value[locale]}
                </dd>
              </div>
            ))}
          </dl>
        }
      />

      <section className="section-y overflow-hidden bg-surface">
        <div className="shell grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <p className="eyebrow">{isPt ? 'Quem somos' : 'Who we are'}</p>
            <h2 className="heading-lg mt-5">
              {isPt
                ? 'Excelência contabilística ao serviço das empresas'
                : 'Accounting excellence for businesses'}
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-secondary">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.pt}>{paragraph[locale]}</p>
              ))}
            </div>

            <blockquote className="mt-10 rounded-r-lg border-l-4 border-accent-500 bg-surface-muted p-7 font-display text-lg leading-relaxed text-ink">
              “{mission[locale]}”
              <footer className="mt-4 text-sm text-ink-muted">
                — {company.ceo.name}, {company.ceo.role[locale]}
              </footer>
            </blockquote>
          </Reveal>

          <Reveal delay={0.12}>
            <ParallaxLayer speed={0.8} tilt={1.5}>
              <TiltCard className="w-full" max={2}>
                <figure className="overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
                  <div className="relative aspect-4/5">
                    <Image
                      src="/team/ceo-mauro-torres-goncalves.png"
                      alt={`${company.ceo.name} — ${isPt ? 'CEO da CTS Consultoria' : 'CEO of CTS Consulting'}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <figcaption className="border-t border-border bg-surface p-5">
                    <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-accent-600">
                      {isPt ? 'Direção & Liderança Executiva' : 'Direction & Executive Leadership'}
                    </p>
                    <p className="mt-2 font-display text-lg font-semibold text-ink">
                      {company.ceo.name}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">{company.ceo.role[locale]}</p>
                  </figcaption>
                </figure>
              </TiltCard>
            </ParallaxLayer>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-surface-muted py-16">
        <div className="shell">
          <Reveal>
            <p className="text-center text-2xs font-semibold uppercase tracking-[0.24em] text-ink-muted">
              {isPt ? 'Homologações e parceiros' : 'Accreditations and partners'}
            </p>
          </Reveal>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
            {PARTNERS.map((partner) => (
              <Reveal key={partner.src} delay={0.05}>
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={220}
                  height={90}
                  className="h-14 w-auto opacity-70 transition-opacity duration-300 hover:opacity-100"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="on-dark relative overflow-hidden bg-ink py-24 text-white">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(0,84,174,0.55), transparent 45%), radial-gradient(circle at 85% 80%, rgba(228,22,32,0.35), transparent 45%)',
          }}
          aria-hidden
        />
        <div className="shell relative grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <Reveal>
            <p className="text-2xs font-semibold uppercase tracking-[0.24em] text-accent-300">
              {anpg.subtitle[locale]}
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white lg:text-4xl">
              {anpg.title[locale]}
            </h2>
            <p className="mt-6 max-w-2xl leading-relaxed text-white/75">{anpg.text[locale]}</p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-pill bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              <ShieldCheck size={16} className="text-accent-300" />
              {isPt ? 'Fornecedor homologado ANPG' : 'ANPG-certified supplier'}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <blockquote className="rounded-xl border border-white/12 bg-white/5 p-8 backdrop-blur-sm">
              <p className="font-display text-lg leading-relaxed text-white/90">
                “{anpg.quote[locale]}”
              </p>
            </blockquote>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="shell">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-primary-700 px-8 py-14 text-center text-white sm:px-14 lg:py-20">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 80% 10%, rgba(255,255,255,0.22), transparent 50%)',
                }}
                aria-hidden
              />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight lg:text-4xl">
                  {isPt
                    ? 'Quer conhecer o trabalho da CTS de perto?'
                    : 'Want to see CTS work up close?'}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-white/80">
                  {isPt
                    ? 'Agende uma conversa com os nossos contabilistas e consultores fiscais em Luanda.'
                    : 'Book a conversation with our accountants and tax consultants in Luanda.'}
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <Link href={`${localePath(locale, 'contact')}#contacto`} className="btn-accent">
                    {isPt ? 'Falar connosco' : 'Contact us'}
                    <ArrowRight size={17} />
                  </Link>
                  <Link href={localePath(locale, 'services')} className="btn-ghost-dark">
                    {isPt ? 'Ver serviços' : 'View services'}
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
