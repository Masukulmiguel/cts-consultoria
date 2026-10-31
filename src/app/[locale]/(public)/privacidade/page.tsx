import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/scroll/reveal';
import { company } from '@/content/services';
import type { Locale } from '@/i18n/routing';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

const COPY = {
  pt: {
    title: 'Política de Privacidade',
    lede: 'Como a CTS Consultoria recolhe, utiliza e protege os dados pessoais que nos confia através deste website e dos nossos serviços.',
    updated: 'Última actualização: 30 de outubro de 2026',
    sections: [
      {
        heading: 'Responsável pelo tratamento',
        body: [
          'A CTS Consultoria Empresarial & Gestão de Negócios, com sede na Rua Avenida Brasil, Casa n° 162 A, 1.º Andar, Rangel, Luanda, Angola, é responsável pelo tratamento dos dados pessoais recolhidos neste website, ao abrigo da Lei n.º 22/11 de Protecção de Dados Pessoais da República de Angola.',
          `Para questões sobre privacidade, contacte-nos através do endereço ${company.email} ou do telefone ${company.phone}.`,
        ],
      },
      {
        heading: 'Dados que recolhemos',
        body: [
          'Através do formulário de contactos recolhemos apenas os dados necessários para responder ao seu pedido: nome, endereço de email, telefone, empresa e a mensagem que nos envia.',
          'Este website não utiliza cookies de publicidade nem ferramentas de perfilamento. São usados apenas cookies técnicos indispensáveis ao funcionamento da sessão e do painel de gestão.',
        ],
      },
      {
        heading: 'Finalidade e fundamento',
        body: [
          'Os dados submetidos no formulário de contactos são utilizados exclusivamente para responder às suas solicitações, preparar propostas de serviços e acompanhar o relacionamento comercial que daí resultar. O fundamento do tratamento é o seu consentimento, prestado no momento do envio do formulário.',
        ],
      },
      {
        heading: 'Conservação e partilha',
        body: [
          'Os dados de contactos são conservados pelo período necessário ao cumprimento das obrigações legais e fiscais aplicáveis aos nossos serviços, e depois eliminados ou anonimizados.',
          'Não vendemos nem cedemos dados pessoais a terceiros para fins de marketing. A partilha ocorre apenas com prestadores de serviços estritamente necessários, sujeitos a deveres de confidencialidade, ou por obrigação legal.',
        ],
      },
      {
        heading: 'Os seus direitos',
        body: [
          'Pode solicitar a acesso, rectificação ou eliminação dos seus dados pessoais, bem como a retirada do consentimento, através de email dirigido à administração da CTS. Respondemos a todos os pedidos no prazo máximo de 30 dias.',
        ],
      },
      {
        heading: 'Segurança',
        body: [
          'Adoptamos medidas técnicas e organizativas adequadas para proteger os dados contra acesso não autorizado, perda ou alteração, incluindo encriptação nas comunicações e controlo de acessos ao nosso sistema de gestão.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    lede: 'How CTS Consulting collects, uses and protects the personal data you entrust to us through this website and our services.',
    updated: 'Last updated: 30 October 2026',
    sections: [
      {
        heading: 'Data controller',
        body: [
          'CTS Business Consulting & Management, headquartered at Rua Avenida Brasil, Casa n° 162 A, 1st Floor, Rangel, Luanda, Angola, is responsible for processing personal data collected through this website under Angolan Data Protection Law No. 22/11.',
          `For privacy questions, contact us at ${company.email} or ${company.phone}.`,
        ],
      },
      {
        heading: 'Data we collect',
        body: [
          'Through the contact form we collect only the data needed to answer your request: name, email address, phone, company and your message.',
          'This website does not use advertising cookies or profiling tools. Only technical cookies required for session and management panel operation are used.',
        ],
      },
      {
        heading: 'Purpose and legal basis',
        body: [
          'Contact form data is used solely to respond to your enquiries, prepare service proposals and manage the commercial relationship that follows. The legal basis is the consent you provide when submitting the form.',
        ],
      },
      {
        heading: 'Retention and sharing',
        body: [
          'Contact data is kept for as long as needed to comply with the legal and tax obligations applicable to our services, then deleted or anonymised.',
          'We do not sell or share personal data with third parties for marketing purposes. Sharing occurs only with essential service providers bound by confidentiality, or where required by law.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You may request access, rectification or erasure of your personal data, as well as withdraw consent, by email to CTS management. We respond to all requests within 30 days.',
        ],
      },
      {
        heading: 'Security',
        body: [
          'We adopt appropriate technical and organisational measures to protect data against unauthorised access, loss or alteration, including encrypted communications and access controls on our management systems.',
        ],
      },
    ],
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: COPY[locale].title,
    description: COPY[locale].lede,
    alternates: { canonical: `/${locale}/privacidade` },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = COPY[locale];

  return (
    <>
      <PageHero eyebrow={locale === 'pt' ? 'Legal' : 'Legal'} title={copy.title} lede={copy.lede} />

      <section className="section-y bg-surface">
        <div className="shell max-w-3xl">
          <p className="text-sm text-ink-muted">{copy.updated}</p>

          <div className="mt-10 space-y-12">
            {copy.sections.map((section, index) => (
              <Reveal key={section.heading} delay={index * 0.03}>
                <article>
                  <h2 className="heading-md">{section.heading}</h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-secondary">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
