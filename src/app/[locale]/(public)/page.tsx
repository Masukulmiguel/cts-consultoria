import { HeroSlider } from '@/components/hero/hero-slider';
import { ParallaxLayer } from '@/components/scroll/parallax-layer';
import { Reveal } from '@/components/scroll/reveal';
import { TaglineReveal } from '@/components/scroll/tagline-reveal';
import { TiltCard } from '@/components/scroll/tilt-card';
import {
  about,
  anpg,
  company,
  facts,
  mission,
  taglineLong,
  trainingFamilies,
} from '@/content/services';
import { getPublicFaqs, getPublicServices } from '@/lib/content-db';
import { localePath } from '@/lib/site';
import { ArrowRight, Award, CheckCircle2, Plus, ShieldCheck, Users } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

/** Os conteúdos vêm da base de dados; revalida a cada 60 segundos. */
export const revalidate = 60;

const GALLERY = [
  {
    src: '/gallery/final-do-curso-1.jpg',
    alt: {
      pt: 'Grupo de seis participantes junto a uma faixa da CTS Consultoria Empresarial numa sala de formação.',
      en: 'Group of six participants beside a CTS Consultoria Empresarial banner in a training room.',
    },
    className: 'sm:col-span-2 sm:row-span-2',
  },
  {
    src: '/gallery/final-do-curso-2.jpg',
    alt: {
      pt: 'Fotografia de seis participantes de um curso a exibir certificados numa sala de formação.',
      en: 'Photo of six course participants holding certificates in a training room.',
    },
    className: '',
  },
  {
    src: '/gallery/final-do-curso-3.jpg',
    alt: {
      pt: 'Oito participantes com certificados de formação diante de uma faixa da CTS numa sala de formação.',
      en: 'Eight participants with training certificates in front of a CTS banner in a training room.',
    },
    className: '',
  },
  {
    src: '/gallery/sala-de-formacao.jpg',
    alt: {
      pt: 'Fotografia de uma sala de formação: formador aponta para o ecrã e participantes trabalham em portáteis.',
      en: 'Training room photo: a trainer points at the screen while participants work on laptops.',
    },
    className: 'sm:col-span-2',
  },
];

const PARTNERS = [
  {
    src: '/partners/inefop.png',
    alt: 'INEFOP — Instituto Nacional de Emprego e Formação Profissional',
  },
  { src: '/partners/anpg.png', alt: 'ANPG — Agência Nacional de Petróleos e Gás' },
  { src: '/partners/agt.png', alt: 'AGT — Administração Geral Tributária' },
];

export default async function HomePage({ params }: { params: Promise<{ locale: 'pt' | 'en' }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isPt = locale === 'pt';
  const services = await getPublicServices();
  const faqs = await getPublicFaqs();

  return (
    <>
      <HeroSlider locale={locale} />

      <section className="border-b border-border bg-surface">
        <div className="shell">
          <dl className="grid grid-cols-2 divide-x divide-border lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label.pt} className="px-4 py-7 first:pl-0 lg:px-6">
                <dt className="text-2xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
                  {fact.label[locale]}
                </dt>
                <dd className="mt-1.5 font-display text-lg font-semibold text-ink">
                  {fact.value[locale]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="shell">
          <Reveal>
            <p className="eyebrow">{isPt ? 'A nossa promessa' : 'Our promise'}</p>
            <TaglineReveal className="mt-7" text={taglineLong[locale]} />
            <p className="mt-8 max-w-[68ch] text-base leading-relaxed text-ink-secondary">
              {isPt
                ? 'Desde 2016, equipas de contabilistas e consultores fiscais acompanham empresas angolanas em Luanda, do fecho mensal à relação com a AGT.'
                : 'Since 2016, teams of accountants and tax consultants have supported Angolan companies in Luanda, from monthly closing to AGT filings.'}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-y overflow-hidden bg-surface">
        <div className="shell grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <p className="eyebrow">{isPt ? 'Institucional' : 'Corporate'}</p>
            <h2 className="heading-lg mt-5">{about.title[locale]}</h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-secondary">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.pt}>{paragraph[locale]}</p>
              ))}
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Users, label: isPt ? '11 a 50 especialistas' : '11 to 50 specialists' },
                { icon: ShieldCheck, label: isPt ? 'Homologação ANPG' : 'ANPG certification' },
                { icon: Award, label: isPt ? 'Certificados INEFOP' : 'INEFOP certificates' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 text-sm font-semibold text-ink"
                >
                  <item.icon size={18} className="shrink-0 text-primary-600" />
                  {item.label}
                </div>
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
                    <p className="font-display text-lg font-semibold text-ink">
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

      <section className="section-y bg-surface-muted">
        <div className="shell">
          <Reveal>
            <p className="eyebrow">{isPt ? 'Soluções empresariais' : 'Business solutions'}</p>
            <h2 className="heading-lg mt-5 max-w-2xl">
              {isPt ? 'Serviços especializados de consultoria' : 'Specialized consulting services'}
            </h2>
            <p className="lede mt-5">
              {isPt
                ? 'Seis áreas que cobrem o ciclo financeiro completo da sua empresa, da escrituração diária à auditoria e ao estudo de viabilidade.'
                : 'Six areas covering the complete financial cycle of your company, from daily bookkeeping to audit and feasibility studies.'}
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.slug[locale]} delay={index * 0.04}>
                <TiltCard className="h-full">
                  <Link
                    href={`${localePath(locale, 'services')}/${service.slug[locale]}`}
                    className="card card-hover group flex h-full flex-col p-7"
                  >
                    <span className="inline-flex w-fit rounded-pill bg-primary-50 px-3 py-1 text-2xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                      {service.category[locale]}
                    </span>
                    <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700">
                      {service.title[locale]}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-secondary">
                      {service.summary[locale]}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
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

      <section className="section-y overflow-hidden bg-surface">
        <div className="shell">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <p className="eyebrow">CTS Academia</p>
              <h2 className="heading-lg mt-5">
                {isPt ? 'Formação profissional' : 'Professional training'}
              </h2>
              <p className="lede mt-5">
                {isPt
                  ? 'Contabilidade, fiscalidade, Primavera v10 e recursos humanos — com certificados homologados pelo INEFOP e estágios profissionais.'
                  : 'Accounting, tax, Primavera v10 and human resources — with INEFOP-homologated certificates and professional internships.'}
              </p>

              <ul className="mt-8 space-y-6">
                {trainingFamilies.map((family) => (
                  <li key={family.title.pt} className="flex gap-4">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-primary-600" />
                    <div>
                      <h3 className="font-display text-lg font-semibold text-ink">
                        {family.title[locale]}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
                        {family.description[locale]}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link href={localePath(locale, 'training')} className="btn-primary">
                  {isPt ? 'Ver formação' : 'View training'}
                  <ArrowRight size={17} />
                </Link>
                <Link href={`${localePath(locale, 'contact')}#contacto`} className="btn-outline">
                  {isPt ? 'Pedir informação' : 'Request information'}
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <ParallaxLayer speed={0.7}>
                <div className="grid grid-cols-2 gap-4">
                  {GALLERY.slice(0, 4).map((item) => (
                    <figure
                      key={item.src}
                      className={`group relative aspect-4/3 overflow-hidden rounded-lg border border-border ${item.className}`}
                    >
                      <TiltCard className="absolute inset-0" max={2}>
                        <Image
                          src={item.src}
                          alt={item.alt[locale]}
                          fill
                          sizes="(max-width: 1024px) 50vw, 30vw"
                          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                        />
                      </TiltCard>
                    </figure>
                  ))}
                </div>
              </ParallaxLayer>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-muted py-14">
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
            <Link href={localePath(locale, 'about')} className="btn-ghost-dark mt-9">
              {isPt ? 'Conhecer a CTS' : 'Get to know CTS'}
              <ArrowRight size={17} />
            </Link>
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

      {faqs.length > 0 ? (
        <section className="section-y bg-surface-muted">
          <div className="shell">
            <Reveal>
              <p className="eyebrow">
                {isPt ? 'Perguntas frequentes' : 'Frequently asked questions'}
              </p>
              <h2 className="heading-lg mt-5 max-w-2xl">
                {isPt
                  ? 'As dúvidas que nos chegam mais souvent'
                  : 'The questions we hear most often'}
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {faqs.map((faq, index) => (
                <Reveal key={faq.id} delay={index * 0.04}>
                  <details className="card card-hover group h-full p-7">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-lg font-semibold text-ink marker:hidden">
                      {faq.question[locale]}
                      <span className="mt-1 shrink-0 text-primary-600 transition-transform duration-200 group-open:rotate-45">
                        <Plus size={18} />
                      </span>
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                      {faq.answer[locale]}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

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
                    ? 'Precisa de um diagnóstico contábil ou fiscal para a sua empresa?'
                    : 'Do you need an accounting or tax assessment for your company?'}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-white/80">
                  {isPt
                    ? 'Fale directamente com os contabilistas e consultores fiscais da CTS em Luanda.'
                    : 'Speak directly with CTS accountants and tax consultants in Luanda.'}
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <Link href={`${localePath(locale, 'contact')}#contacto`} className="btn-accent">
                    {isPt ? 'Agendar consulta' : 'Book a consultation'}
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

      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD estático, sem input do utilizador
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'AccountingService',
                '@id': `${company.site}/#organization`,
                name: company.name,
                url: company.site,
                logo: `${company.site}/brand/cts-wordmark.png`,
                image: `${company.site}/team/ceo-mauro-torres-goncalves.png`,
                foundingDate: '2016',
                telephone: '+244992771895',
                email: company.email,
                priceRange: '$$',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: 'Rua Avenida Brasil, Casa n° 162 A, 1.º Andar',
                  addressLocality: 'Rangel, Luanda',
                  addressCountry: 'AO',
                },
                areaServed: { '@type': 'Country', name: 'Angola' },
                sameAs: [
                  'https://www.facebook.com/consultoriacts',
                  'https://www.linkedin.com/company/consultoriacts',
                  'https://www.instagram.com/consultoriacts',
                ],
              },
              ...services.map((service) => ({
                '@type': 'Service',
                name: service.title[locale],
                description: service.summary[locale],
                provider: { '@id': `${company.site}/#organization` },
                areaServed: 'AO',
              })),
              ...(faqs.length > 0
                ? [
                    {
                      '@type': 'FAQPage',
                      mainEntity: faqs.map((faq) => ({
                        '@type': 'Question',
                        name: faq.question[locale],
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: faq.answer[locale],
                        },
                      })),
                    },
                  ]
                : []),
            ],
          }),
        }}
      />
    </>
  );
}
