import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/scroll/reveal';
import type { Locale } from '@/i18n/routing';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

const COPY = {
  pt: {
    title: 'Termos de Utilização',
    lede: 'Regras aplicáveis à utilização deste website institucional da CTS Consultoria Empresarial & Gestão de Negócios.',
    updated: 'Última actualização: 30 de outubro de 2026',
    sections: [
      {
        heading: 'Âmbito',
        body: [
          'Este website tem carácter informativo e institucional. Ao utilizá-lo, aceita os termos aqui descritos. Caso não concorde, solicitamos que abstenha a sua utilização.',
        ],
      },
      {
        heading: 'Conteúdo informativo',
        body: [
          'A informação publicada sobre serviços de contabilidade, consultoria fiscal, implementação de ERP, auditoria e formação profissional tem natureza geral e não substitui aconselhamento profissional adaptado à situação concreta de cada empresa.',
          'Procuramos manter o conteúdo actualizado e correcto, mas não garantimos a ausência absoluta de erros ou omissões.',
        ],
      },
      {
        heading: 'Propriedade intelectual',
        body: [
          'Todos os textos, logótipos, fotografias e restantes elementos deste website pertencem à CTS Consultoria Empresarial & Gestão de Negócios ou são usados mediante autorização. A reprodução total ou parcial sem consentimento prévio por escrito é proibida.',
        ],
      },
      {
        heading: 'Pedidos de contacto e propostas',
        body: [
          'O envio de um pedido através do formulário de contactos não gera qualquer vínculo contratual. Os serviços só se consideram contratados mediante proposta escrita aceite e celebrada nos termos do respectivo contrato de prestação de serviços.',
        ],
      },
      {
        heading: 'Ligações externas',
        body: [
          'Este website pode conter ligações para páginas de terceiros, incluindo parceiros institucionais e redes sociais. A CTS não controla nem responde pelo conteúdo ou políticas dessas páginas.',
        ],
      },
      {
        heading: 'Alterações',
        body: [
          'A CTS reserva-se o direito de alterar estes termos e o conteúdo do website a qualquer momento, sem aviso prévio. A versão publicada nesta página é a vigente.',
        ],
      },
      {
        heading: 'Legislação aplicável',
        body: [
          'Estes termos regem-se pela legislação da República de Angola. Para qualquer litígio, são competentes os tribunais judiciais de Luanda, com renúncia expressa a qualquer outra jurisdição.',
        ],
      },
    ],
  },
  en: {
    title: 'Terms of Use',
    lede: 'Rules governing the use of this institutional website of CTS Business Consulting & Management.',
    updated: 'Last updated: 30 October 2026',
    sections: [
      {
        heading: 'Scope',
        body: [
          'This website is informative and institutional in nature. By using it you accept the terms described here. If you disagree, please refrain from using it.',
        ],
      },
      {
        heading: 'Informative content',
        body: [
          'Published information about accounting, tax consulting, ERP implementation, audit and professional training services is general in nature and does not replace professional advice tailored to each company’s specific situation.',
          'We strive to keep the content accurate and current, but do not guarantee the absolute absence of errors or omissions.',
        ],
      },
      {
        heading: 'Intellectual property',
        body: [
          'All texts, logos, photographs and other elements of this website belong to CTS Business Consulting & Management or are used with authorisation. Full or partial reproduction without prior written consent is prohibited.',
        ],
      },
      {
        heading: 'Contact requests and proposals',
        body: [
          'Submitting a request through the contact form creates no contractual link. Services are only contracted through a written proposal that is accepted and executed under the terms of the respective service agreement.',
        ],
      },
      {
        heading: 'External links',
        body: [
          'This website may contain links to third-party pages, including institutional partners and social networks. CTS does not control and is not responsible for the content or policies of those pages.',
        ],
      },
      {
        heading: 'Changes',
        body: [
          'CTS reserves the right to change these terms and the website content at any time, without prior notice. The version published on this page is the one in force.',
        ],
      },
      {
        heading: 'Governing law',
        body: [
          'These terms are governed by the laws of the Republic of Angola. Any dispute falls within the jurisdiction of the courts of Luanda, with express waiver of any other jurisdiction.',
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
    alternates: { canonical: `/${locale}/termos` },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: Locale }> }) {
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
