import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/scroll/reveal';
import { company } from '@/content/services';
import type { PublicService } from '@/lib/content-db';
import { localePath, sectionPath } from '@/lib/site';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function ServiceDetailView({
  locale,
  slug,
  services,
}: {
  locale: 'pt' | 'en';
  slug: string;
  services: PublicService[];
}) {
  const isPt = locale === 'pt';
  const service = services.find((s) => s.slug[locale] === slug);
  if (!service) return null;

  const others = services.filter((s) => s.slug[locale] !== service.slug[locale]).slice(0, 3);
  const whatsappText = encodeURIComponent(
    isPt
      ? `Olá! Gostaria de uma proposta para: ${service.title.pt}.`
      : `Hello! I would like a proposal for: ${service.title.en}.`,
  );

  return (
    <>
      <PageHero
        eyebrow={service.category[locale]}
        title={service.title[locale]}
        lede={service.summary[locale]}
        aside={
          <div className="rounded-xl border border-border bg-surface-muted px-7 py-6">
            <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-accent-600">
              {service.category[locale]}
            </p>
            <Link href={sectionPath(locale, 'services')} className="link-underline mt-4 text-sm">
              <ArrowLeft size={15} />
              {isPt ? 'Todos os serviços' : 'All services'}
            </Link>
          </div>
        }
      />

      <section className="section-y bg-surface">
        <div className="shell grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <h2 className="heading-md">{isPt ? 'O que está incluído' : 'What is included'}</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {service.bullets.map((bullet) => (
                <li
                  key={bullet.pt}
                  className="card flex gap-3 p-5 text-sm leading-relaxed text-ink-secondary"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary-600" />
                  <span>{bullet[locale]}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="card p-7">
              <h2 className="font-display text-xl font-semibold text-ink">
                {isPt ? 'Proposta à medida da sua empresa' : 'A proposal tailored to your company'}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                {isPt
                  ? 'Fale connosco para receber uma proposta à medida da sua empresa, com prazos e investimento overview.'
                  : 'Contact us to receive a proposal tailored to your company, with timelines and investment overview.'}
              </p>
              <div className="mt-7 flex flex-col gap-3">
                <a
                  href={`${company.whatsappHref}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent"
                >
                  {isPt ? 'Pedir proposta no WhatsApp' : 'Request a proposal on WhatsApp'}
                  <ArrowRight size={17} />
                </a>
                <Link href={`${localePath(locale, 'contact')}#contacto`} className="btn-outline">
                  {isPt ? 'Enviar mensagem' : 'Send a message'}
                </Link>
              </div>
              <p className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-ink-muted">
                {isPt
                  ? 'Os orçamentos dependem do volume de transaksi, do número de funcionários e do âmbito dos serviços contratados.'
                  : 'Quotes depend on transaction volume, headcount and the scope of contracted services.'}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-y border-t border-border bg-surface-muted">
        <div className="shell">
          <Reveal>
            <h2 className="heading-md">{isPt ? 'Outros serviços' : 'Other services'}</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {others.map((other, index) => (
              <Reveal key={other.slug[locale]} delay={index * 0.05}>
                <Link
                  href={`${sectionPath(locale, 'services')}/${other.slug[locale]}`}
                  className="card card-hover group flex h-full flex-col p-6"
                >
                  <span className="inline-flex w-fit rounded-pill bg-primary-50 px-3 py-1 text-2xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                    {other.category[locale]}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700">
                    {other.title[locale]}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-secondary">
                    {other.summary[locale]}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                    {isPt ? 'Saber mais' : 'Learn more'}
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD estático, sem input do utilizador
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.title[locale],
            description: service.summary[locale],
            serviceType: service.category[locale],
            provider: { '@type': 'AccountingService', name: company.name },
            areaServed: { '@type': 'Country', name: 'Angola' },
            url: `${company.site}${sectionPath(locale, 'services')}/${service.slug[locale]}`,
          }),
        }}
      />
    </>
  );
}
