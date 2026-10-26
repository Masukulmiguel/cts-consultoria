import { ContactForm } from '@/components/contact-form';
import { Reveal } from '@/components/reveal';
import { company } from '@/content/services';
import type { Locale } from '@/i18n/routing';

export function ContactView({ locale }: { locale: Locale }) {
  return (
    <>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
          {locale === 'pt' ? 'Localização & Atendimento' : 'Location & Service'}
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-ink">
          {locale === 'pt' ? 'Contactos' : 'Contact'}
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600">
          {locale === 'pt'
            ? 'Estamos estrategicamente localizados na Avenida Brasil, Rangel, de frente ao Ministério da Acção Social.'
            : 'We are strategically located on Avenida Brasil, Rangel, opposite the Ministry of Social Action.'}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {locale === 'pt' ? 'Sede Principal' : 'Headquarters'}
              </h2>
              <p className="mt-3 text-ink">{company.address}</p>
              <p className="mt-1 text-sm text-gray-500">{company.addressNote[locale]}</p>
              <a
                href={company.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-brand-blue hover:underline"
              >
                {locale === 'pt' ? 'Abrir no Google Maps →' : 'Open in Google Maps →'}
              </a>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {locale === 'pt' ? 'Contactos Oficiais' : 'Official Contacts'}
              </h2>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href={company.phoneHref}
                    className="font-semibold text-ink hover:text-brand-blue"
                  >
                    {company.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={company.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#0E7A4F] hover:underline"
                  >
                    WhatsApp {company.whatsapp}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="rounded-lg border border-gray-200 border-t-4 border-t-brand-blue bg-white p-8">
            <h2 className="text-xl font-semibold text-ink">
              {locale === 'pt' ? 'Envie-nos uma mensagem' : 'Send us a message'}
            </h2>
            <div className="mt-6">
              <ContactForm locale={locale} />
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
