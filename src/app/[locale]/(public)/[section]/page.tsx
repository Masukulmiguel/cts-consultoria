import { AboutView } from '@/components/views/about-view';
import { ContactView } from '@/components/views/contact-view';
import { NewsView } from '@/components/views/news-view';
import { ServicesView } from '@/components/views/services-view';
import { TrainingView } from '@/components/views/training-view';
import { allSectionParams, resolveSection } from '@/content/routes';
import type { Locale } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return allSectionParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; section: string }>;
}) {
  const { locale, section } = await params;
  const key = resolveSection(locale, section);
  if (!key) return {};

  const titles = {
    about: { pt: 'Sobre Nós', en: 'About Us' },
    services: { pt: 'Serviços', en: 'Services' },
    training: { pt: 'Formação Profissional', en: 'Professional Training' },
    news: { pt: 'Notícias e Recursos', en: 'News & Resources' },
    contact: { pt: 'Contactos', en: 'Contact' },
  } as const;
  const descriptions = {
    about: {
      pt: 'Fundada em 2016 em Luanda, a CTS é referência em contabilidade, fiscalidade e gestão empresarial em Angola.',
      en: 'Founded in 2016 in Luanda, CTS is a reference in accounting, tax and business management in Angola.',
    },
    services: {
      pt: 'Contabilidade, fiscalidade, ERP Primavera v10, auditoria, viabilidade económica e gestão de RH em Luanda.',
      en: 'Accounting, tax, Primavera ERP v10, audit, economic feasibility and HR management in Luanda.',
    },
    training: {
      pt: 'Formação prática em contabilidade, fiscalidade e Primavera v10 com certificados homologados pelo INEFOP.',
      en: 'Practical training in accounting, tax and Primavera v10 with INEFOP-homologated certificates.',
    },
    news: {
      pt: 'Artigos e notícias sobre contabilidade, fiscalidade e gestão empresarial em Angola.',
      en: 'Articles and news about accounting, tax and business management in Angola.',
    },
    contact: {
      pt: 'Contacte a CTS na Avenida Brasil, Rangel, Luanda. Telefone, WhatsApp e formulário de contactos.',
      en: 'Contact CTS on Avenida Brasil, Rangel, Luanda. Phone, WhatsApp and contact form.',
    },
  } as const;

  return {
    title: titles[key][locale],
    description: descriptions[key][locale],
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ locale: Locale; section: string }>;
}) {
  const { locale, section } = await params;
  const key = resolveSection(locale, section);
  if (!key) notFound();
  setRequestLocale(locale);

  switch (key) {
    case 'about':
      return <AboutView locale={locale} />;
    case 'services':
      return <ServicesView locale={locale} />;
    case 'training':
      return <TrainingView locale={locale} />;
    case 'news':
      return <NewsView locale={locale} />;
    case 'contact':
      return <ContactView locale={locale} />;
  }
}
