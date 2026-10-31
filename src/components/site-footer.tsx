import { company, services } from '@/content/services';
import type { Locale } from '@/i18n/routing';
import { localePath } from '@/lib/site';
import { ArrowUp, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SocialLinks } from './ui/social-links';

const COPY = {
  pt: {
    navigation: 'Navegação',
    services: 'Serviços',
    contact: 'Contactos',
    specialties: 'Especialidades',
    address: 'Morada',
    privacy: 'Privacidade',
    terms: 'Termos',
    rights: 'Todos os direitos reservados.',
    since: 'Desde 2016 · Luanda, Angola',
    backToTop: 'Voltar ao topo',
    anpg: 'Fornecedor homologado',
    tagline:
      'Contabilidade, fiscalidade, ERP, estratégia, auditoria e recursos humanos para empresas angolanas.',
  },
  en: {
    navigation: 'Navigation',
    services: 'Services',
    contact: 'Contact',
    specialties: 'Specialties',
    address: 'Address',
    privacy: 'Privacy',
    terms: 'Terms',
    rights: 'All rights reserved.',
    since: 'Since 2016 · Luanda, Angola',
    backToTop: 'Back to top',
    anpg: 'Certified supplier',
    tagline: 'Accounting, tax, ERP, strategy, audit and human resources for Angolan companies.',
  },
} as const;

export async function SiteFooter({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const specialties = services
    .map((service) => service.category[locale])
    .filter((value, index, list) => list.indexOf(value) === index);

  return (
    <footer className="on-dark bg-ink text-white/70">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:py-20">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/brand/cts-mark.png"
              alt="CTS"
              width={300}
              height={287}
              className="h-12 w-auto"
            />
            <div>
              <p className="font-display text-xl font-bold text-white">CTS</p>
              <p className="text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">
                Consultoria Empresarial
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-sm text-sm leading-relaxed">{copy.tagline}</p>

          <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-xs">
            <strong className="text-white">ANPG</strong>
            {copy.anpg}
          </p>

          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-white/45">
            {copy.specialties}
          </p>
          <p className="mt-2 text-sm text-white/70">{specialties.join(' · ')}</p>
        </div>

        <nav aria-label={copy.navigation}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white">
            {copy.navigation}
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {(['about', 'services', 'training', 'news', 'contact'] as const).map((key) => (
              <li key={key}>
                <Link href={localePath(locale, key)} className="transition-colors hover:text-white">
                  {locale === 'pt'
                    ? {
                        about: 'Sobre Nós',
                        services: 'Serviços',
                        training: 'Formação',
                        news: 'Notícias',
                        contact: 'Contactos',
                      }[key]
                    : {
                        about: 'About Us',
                        services: 'Services',
                        training: 'Training',
                        news: 'News',
                        contact: 'Contact',
                      }[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white">
            {copy.services}
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {services.map((service) => (
              <li key={service.slug[locale]}>
                <Link
                  href={`${localePath(locale, 'services')}/${service.slug[locale]}`}
                  className="transition-colors hover:text-white"
                >
                  {service.title[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white">
            {copy.contact}
          </p>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0 text-accent-500" />
              <a
                href={company.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                {company.address}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone size={17} className="mt-0.5 shrink-0 text-accent-500" />
              <a href={company.phoneHref} className="transition-colors hover:text-white">
                {company.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail size={17} className="mt-0.5 shrink-0 text-accent-500" />
              <a href={`mailto:${company.email}`} className="transition-colors hover:text-white">
                {company.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-6 py-7 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/45">
            © 2016–{new Date().getFullYear()} {company.name}. {copy.rights}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <SocialLinks className="flex items-center gap-2" />
            <Link
              href={`/${locale}/privacidade`}
              className="text-xs text-white/45 transition-colors hover:text-white"
            >
              {copy.privacy}
            </Link>
            <Link
              href={`/${locale}/termos`}
              className="text-xs text-white/45 transition-colors hover:text-white"
            >
              {copy.terms}
            </Link>
            <a
              href="#topo"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-white"
            >
              {copy.backToTop}
              <ArrowUp size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
