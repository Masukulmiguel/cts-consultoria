import type { Localized } from '@/content/services';

export type HeroSlide = {
  id: string;
  image: string;
  kicker: Localized;
  title: Localized;
  text: Localized;
  cta: { label: Localized; href: Localized };
  secondary: { label: Localized; href: Localized };
};

export const heroSlides: HeroSlide[] = [
  {
    id: 'contabilidade',
    image: '/hero/hero-03.jpg',
    kicker: { pt: 'Contabilidade · Fiscalidade · ERP', en: 'Accounting · Tax · ERP' },
    title: {
      pt: 'Conformidade financeira que sustenta decisões de gestão',
      en: 'Financial compliance that backs every management decision',
    },
    text: {
      pt: 'Escrituração, apuramento fiscal perante a AGT e fecho de contas de acordo com o PGC-NIRF, com dados fidedignos para o seu negócio.',
      en: 'Bookkeeping, AGT tax filing and year-end closing under PGC-NIRF, with reliable data behind your business.',
    },
    cta: {
      label: { pt: 'Conhecer os serviços', en: 'Explore our services' },
      href: { pt: '/pt/servicos', en: '/en/services' },
    },
    secondary: {
      label: { pt: 'Pedir diagnóstico', en: 'Request an assessment' },
      href: { pt: '/pt/contactos#contacto', en: '/en/contact#contact' },
    },
  },
  {
    id: 'formacao',
    image: '/hero/hero-01.jpg',
    kicker: { pt: 'CTS Academia', en: 'CTS Academy' },
    title: {
      pt: 'Formação prática com certificados homologados pelo INEFOP',
      en: 'Practical training with INEFOP-homologated certificates',
    },
    text: {
      pt: 'Contabilidade e fiscalidade em níveis Júnior, Intermédio e Sénior com Primavera v10, gestão de recursos humanos e treinamento de fecho de contas.',
      en: 'Accounting and tax at Junior, Intermediate and Senior levels with Primavera v10, HR management and year-end closing training.',
    },
    cta: {
      label: { pt: 'Ver formação', en: 'View training' },
      href: { pt: '/pt/formacao', en: '/en/training' },
    },
    secondary: {
      label: { pt: 'Falar com um consultor', en: 'Talk to a consultant' },
      href: { pt: '/pt/contactos#contacto', en: '/en/contact#contact' },
    },
  },
  {
    id: 'anpg',
    image: '/hero/hero-02.jpg',
    kicker: { pt: 'Certificação oficial', en: 'Official certification' },
    title: {
      pt: 'Fornecedor homologado pela ANPG',
      en: 'Certified ANPG supplier',
    },
    text: {
      pt: 'Auditabilidade e rigor para o setor de Petróleo e Gás, com habilitação técnica para contabilidade, fiscalidade e auditoria especializada.',
      en: 'Auditability and rigor for the Oil & Gas sector, with technical qualification for accounting, tax and specialized audit services.',
    },
    cta: {
      label: { pt: 'Sobre a CTS', en: 'About CTS' },
      href: { pt: '/pt/sobre', en: '/en/about' },
    },
    secondary: {
      label: { pt: 'Contactos', en: 'Contact' },
      href: { pt: '/pt/contactos#contacto', en: '/en/contact#contact' },
    },
  },
  {
    id: 'fecho',
    image: '/hero/hero-04.jpg',
    kicker: { pt: 'Equipa de especialistas', en: 'A team of specialists' },
    title: {
      pt: 'Da escrituração ao fecho de contas, sem interromper a operação',
      en: 'From bookkeeping to year-end closing, without interrupting operations',
    },
    text: {
      pt: '11 a 50 especialistas em contabilidade, fiscalidade, recursos humanos e auditoria, com sede em Rangel, Luanda.',
      en: '11 to 50 specialists in accounting, tax, human resources and audit, based in Rangel, Luanda.',
    },
    cta: {
      label: { pt: 'Serviços', en: 'Services' },
      href: { pt: '/pt/servicos', en: '/en/services' },
    },
    secondary: {
      label: { pt: 'Notícias', en: 'News' },
      href: { pt: '/pt/noticias', en: '/en/news' },
    },
  },
];
