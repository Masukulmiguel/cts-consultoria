import { ContactForm } from '@/components/contact-form';
import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/scroll/reveal';
import { company } from '@/content/services';
import { localePath } from '@/lib/site';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export function ContactView({ locale }: { locale: 'pt' | 'en' }) {
  const isPt = locale === 'pt';

  return (
    <>
      <PageHero
        eyebrow={isPt ? 'Localização & atendimento' : 'Location & service'}
        title={isPt ? 'Contactos' : 'Contact'}
        lede={
          isPt
            ? 'Estamos estrategicamente localizados na Avenida Brasil, Rangel, de frente ao Ministério da Acção Social (MASFAMU).'
            : 'We are strategically located on Avenida Brasil, Rangel, opposite the Ministry of Social Action (MASFAMU).'
        }
      />

      <section id="contacto" className="section-y scroll-mt-32 bg-surface-muted">
        <div className="shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="space-y-5">
              <article className="card p-7">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <MapPin size={20} />
                </span>
                <h2 className="mt-5 font-display text-lg font-semibold text-ink">
                  {isPt ? 'Sede principal' : 'Headquarters'}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{company.address}</p>
                <p className="mt-2 text-sm text-ink-muted">{company.addressNote[locale]}</p>
                <a
                  href={company.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline mt-5 text-sm"
                >
                  {isPt ? 'Abrir no Google Maps' : 'Open in Google Maps'}
                  <ArrowRight size={15} />
                </a>
              </article>

              <article className="card p-7">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                  <Phone size={20} />
                </span>
                <h2 className="mt-5 font-display text-lg font-semibold text-ink">
                  {isPt ? 'Contactos oficiais' : 'Official contacts'}
                </h2>
                <ul className="mt-4 space-y-3">
                  <li>
                    <a href={company.phoneHref} className="link-underline text-sm">
                      {company.phone}
                    </a>
                  </li>
                  <li>
                    <a
                      href={company.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline text-sm"
                    >
                      WhatsApp {company.whatsapp}
                    </a>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-ink-secondary">
                    <Mail size={15} className="text-ink-muted" />
                    {company.email}
                  </li>
                </ul>
              </article>

              <article className="card bg-primary-700 p-7 text-white">
                <h2 className="font-display text-lg font-semibold text-white">
                  {isPt ? 'Prefere formação?' : 'Looking for training?'}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {isPt
                    ? 'A CTS Academia tem formações práticas em contabilidade, fiscalidade, Primavera v10 e gestão de RH, com certificados homologados pelo INEFOP.'
                    : 'CTS Academy offers practical training in accounting, tax, Primavera v10 and HR management, with INEFOP-homologated certificates.'}
                </p>
                <Link href={localePath(locale, 'training')} className="btn-ghost-dark mt-6">
                  {isPt ? 'Ver formação' : 'View training'}
                  <ArrowRight size={17} />
                </Link>
              </article>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="card p-8 lg:p-10">
              <p className="eyebrow">{isPt ? 'Pedido de informação' : 'Information request'}</p>
              <h2 className="heading-md mt-5">
                {isPt ? 'Envie-nos uma mensagem' : 'Send us a message'}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                {isPt
                  ? 'Descreva o seu pedido e a equipa CTS responde em horário de expediente, normalmente em menos de um dia útil.'
                  : 'Describe your request and the CTS team replies during business hours, normally within one working day.'}
              </p>
              <div className="mt-8">
                <ContactForm locale={locale} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
