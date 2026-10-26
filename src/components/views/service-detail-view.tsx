import { Reveal } from '@/components/reveal';
import { ButtonLink } from '@/components/ui/button-link';
import { company, services } from '@/content/services';
import { type Locale, sectionPath } from '@/lib/site';
import Link from 'next/link';

export function ServiceDetailView({ locale, slug }: { locale: Locale; slug: string }) {
  const service = services.find((s) => s.slug[locale] === slug);
  if (!service) return null;

  const whatsappText = encodeURIComponent(
    locale === 'pt'
      ? `Olá! Gostaria de uma proposta para: ${service.title.pt}.`
      : `Hello! I would like a proposal for: ${service.title.en}.`,
  );

  return (
    <>
      <Reveal>
        <Link
          href={sectionPath(locale, 'services')}
          className="text-sm text-brand-blue hover:underline"
        >
          ← {locale === 'pt' ? 'Todos os serviços' : 'All services'}
        </Link>
        <p className="mt-8 text-sm font-semibold tracking-widest text-brand-red">
          {service.number}
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">{service.title[locale]}</h1>
        <p className="mt-6 text-lg text-gray-600">{service.summary[locale]}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <ul className="mt-10 space-y-4">
          {service.bullets.map((b) => (
            <li key={b.pt} className="flex gap-3 text-gray-700">
              <span className="mt-1 text-brand-red" aria-hidden>
                ✓
              </span>
              {b[locale]}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="mt-12 rounded-lg border border-gray-200 bg-surface p-8">
          <h2 className="text-lg font-semibold text-ink">
            {locale === 'pt'
              ? 'Proposta à medida da sua empresa'
              : 'A proposal tailored to your company'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {locale === 'pt'
              ? 'Fale connosco para receber uma proposta à medida da sua empresa.'
              : 'Contact us to receive a proposal tailored to your company.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <ButtonLink
              href={`${company.whatsappHref}?text=${whatsappText}`}
              variant="accent"
              external
            >
              {locale === 'pt' ? 'Pedir proposta no WhatsApp' : 'Request a proposal on WhatsApp'}
            </ButtonLink>
            <ButtonLink href={sectionPath(locale, 'services')} variant="outline">
              {locale === 'pt' ? 'Ver outros serviços' : 'See other services'}
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </>
  );
}
