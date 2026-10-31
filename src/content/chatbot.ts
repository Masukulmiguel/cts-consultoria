import { company, services, trainingFamilies } from '@/content/services';

export type Locale = 'pt' | 'en';

export type ChatLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type ChatReply = {
  text: string;
  links?: ChatLink[];
  suggestions?: string[];
};

type Intent = {
  id: string;
  keywords: string[];
  build: (locale: Locale) => ChatReply;
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim();
}

function score(message: string, keywords: string[]): number {
  let total = 0;
  for (const keyword of keywords) {
    if (message.includes(keyword)) total += keyword.includes(' ') ? 3 : 2;
  }
  return total;
}

function serviceReply(index: number, locale: Locale): ChatReply {
  const service = services[index];
  return {
    text:
      locale === 'pt'
        ? `${service.title.pt}: ${service.summary.pt} Quer que eu o ligue à página do serviço ou prefere pedir uma proposta?`
        : `${service.title.en}: ${service.summary.en} Shall I take you to the service page, or would you like to request a proposal?`,
    links: [
      {
        label: locale === 'pt' ? `Ver ${service.title.pt}` : `View ${service.title.en}`,
        href: `/${locale}/${locale === 'pt' ? 'servicos' : 'services'}/${service.slug[locale]}`,
      },
      {
        label: locale === 'pt' ? 'Pedir proposta' : 'Request a proposal',
        href: `/${locale}/${locale === 'pt' ? 'contactos' : 'contact'}#contacto`,
      },
    ],
    suggestions:
      locale === 'pt'
        ? ['Formação profissional', 'Quanto custa?', 'Falar connosco']
        : ['Professional training', 'How much does it cost?', 'Talk to us'],
  };
}

const companyInfo = (locale: Locale): string =>
  locale === 'pt'
    ? `A ${company.shortName} funciona desde ${company.since} em Luanda, com 11 a 50 especialistas em contabilidade, fiscalidade e gestão. Morada: ${company.address}.`
    : `${company.shortName} has operated since ${company.since} in Luanda, with 11 to 50 specialists in accounting, tax and management. Address: ${company.address}.`;

const contactReply = (locale: Locale): ChatReply => ({
  text:
    locale === 'pt'
      ? `Pode falar connosco agora: ${company.phone} (telefone) ou ${company.whatsapp} (WhatsApp). Email: ${company.email}. Estamos na ${company.address}, ${company.addressNote.pt}.`
      : `Reach us now: ${company.phone} (phone) or ${company.whatsapp} (WhatsApp). Email: ${company.email}. We are at ${company.address}, ${company.addressNote.en}.`,
  links: [
    {
      label: locale === 'pt' ? 'Abrir WhatsApp' : 'Open WhatsApp',
      href: company.whatsappHref,
      external: true,
    },
    { label: company.phone, href: company.phoneHref },
    { label: company.email, href: `mailto:${company.email}` },
    {
      label: locale === 'pt' ? 'Ver contactos' : 'View contact page',
      href: `/${locale}/${locale === 'pt' ? 'contactos' : 'contact'}`,
    },
  ],
  suggestions:
    locale === 'pt'
      ? ['Agendar consulta', 'Pedir proposta', 'Horário de atendimento']
      : ['Book a consultation', 'Request a proposal', 'Opening hours'],
});

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    keywords: [
      'ola',
      'oi',
      'bom dia',
      'boa tarde',
      'boa noite',
      'hello',
      'hi',
      'hey',
      'good morning',
    ],
    build: (locale) => ({
      text:
        locale === 'pt'
          ? 'Olá! Sou o assistente da CTS Consultoria. Posso ajudar com serviços de contabilidade, fiscalidade, formação ou contactos. Como posso ajudar?'
          : 'Hello! I am the CTS Consulting assistant. I can help with accounting, tax, training or contact questions. How can I help?',
      suggestions:
        locale === 'pt'
          ? ['Serviços', 'Formação profissional', 'Pedir proposta', 'Contactos']
          : ['Services', 'Professional training', 'Request a proposal', 'Contacts'],
    }),
  },
  {
    id: 'accounting',
    keywords: [
      'contabilidade',
      'contabilistica',
      'contabilista',
      'escrituracao',
      'balancete',
      'pgc',
      'nirf',
      'fecho de contas',
      'balanco',
      'demonstracoes financeiras',
      'accounting',
      'bookkeeping',
    ],
    build: (locale) => serviceReply(0, locale),
  },
  {
    id: 'tax',
    keywords: [
      'fiscal',
      'fiscalidade',
      'imposto',
      'impostos',
      'iva',
      'irt',
      'agt',
      'selo',
      'declaracao',
      'modelo 1',
      'retencao',
      'tax',
      'vat',
    ],
    build: (locale) => serviceReply(1, locale),
  },
  {
    id: 'erp',
    keywords: ['primavera', 'erp', 'software', 'gestao integrada', 'sgps', 'primavera v10'],
    build: (locale) => serviceReply(2, locale),
  },
  {
    id: 'feasibility',
    keywords: [
      'viabilidade',
      'estudo de viabilidade',
      'investimento',
      'business plan',
      'feasibility',
    ],
    build: (locale) => serviceReply(3, locale),
  },
  {
    id: 'audit',
    keywords: ['auditoria', 'auditor', 'inspecao', 'auditoria financeira', 'audit'],
    build: (locale) => serviceReply(4, locale),
  },
  {
    id: 'hr',
    keywords: [
      'recursos humanos',
      'rh',
      'salario',
      'salarios',
      'inss',
      'folha de pagamento',
      'payroll',
      'contratacao',
      'hr',
    ],
    build: (locale) => serviceReply(5, locale),
  },
  {
    id: 'training',
    keywords: [
      'formacao',
      'curso',
      'cursos',
      'treino',
      'treinamento',
      'capacitacao',
      'certificado',
      'inefop',
      'training',
      'academia',
      'cts academia',
    ],
    build: (locale) => ({
      text:
        locale === 'pt'
          ? `A CTS Academia oferece ${trainingFamilies.length} famílias de formação prática: ${trainingFamilies.map((f) => f.title.pt).join('; ')}. Os certificados são homologados pelo INEFOP.`
          : `CTS Academy offers ${trainingFamilies.length} families of practical training: ${trainingFamilies.map((f) => f.title.en).join('; ')}. Certificates are INEFOP-homologated.`,
      links: [
        {
          label: locale === 'pt' ? 'Ver formação' : 'View training',
          href: `/${locale}/${locale === 'pt' ? 'formacao' : 'training'}`,
        },
      ],
      suggestions:
        locale === 'pt'
          ? ['Contabilidade para não contabilistas', 'Primavera v10', 'Estágios profissionais']
          : ['Accounting for non-accountants', 'Primavera v10', 'Professional internships'],
    }),
  },
  {
    id: 'internship',
    keywords: ['estagio', 'estagios', 'estagiar', 'internship', 'intern'],
    build: (locale) => ({
      text:
        locale === 'pt'
          ? 'A CTS acompanha estágios profissionais em parceria com o INEFOP. Para candidaturas, fale connosco pelo formulário de contactos ou WhatsApp.'
          : 'CTS supports professional internships in partnership with INEFOP. For applications, reach us through the contact form or WhatsApp.',
      links: [
        {
          label: locale === 'pt' ? 'Formação e estágios' : 'Training and internships',
          href: `/${locale}/${locale === 'pt' ? 'formacao' : 'training'}`,
        },
        {
          label: locale === 'pt' ? 'Abrir WhatsApp' : 'Open WhatsApp',
          href: company.whatsappHref,
          external: true,
        },
      ],
    }),
  },
  {
    id: 'anpg',
    keywords: ['anpg', 'homologacao', 'homologado', 'homologada', 'petroleo', 'gas', 'oil and gas'],
    build: (locale) => ({
      text:
        locale === 'pt'
          ? 'A CTS é fornecedora homologada pela ANPG (Agência Nacional de Petróleos e Gás), o que comprova o rigor dos nossos processos contabilísticos e fiscais para o setor.'
          : 'CTS is an ANPG-certified supplier (National Agency of Petroleum and Gas), which proves the rigor of our accounting and tax processes for the sector.',
      links: [
        {
          label: locale === 'pt' ? 'Sobre a CTS' : 'About CTS',
          href: `/${locale}/${locale === 'pt' ? 'sobre' : 'about'}`,
        },
      ],
    }),
  },
  {
    id: 'pricing',
    keywords: [
      'preco',
      'precos',
      'custo',
      'custos',
      'quanto custa',
      'quanto custam',
      'valor',
      'orcamento',
      'price',
      'cost',
      'quote',
    ],
    build: (locale) => ({
      text:
        locale === 'pt'
          ? 'Os valores dependem do volume de faturação e do âmbito de cada serviço. Enviamos uma proposta personalizada em 48 horas úteis depois de conhecermos a sua empresa.'
          : 'Fees depend on turnover volume and the scope of each service. We send a tailored proposal within 48 business hours after getting to know your company.',
      links: [
        {
          label: locale === 'pt' ? 'Pedir proposta' : 'Request a proposal',
          href: `/${locale}/${locale === 'pt' ? 'contactos' : 'contact'}#contacto`,
        },
      ],
    }),
  },
  {
    id: 'contact',
    keywords: [
      'contacto',
      'contactos',
      'telefone',
      'telemovel',
      'email',
      'morada',
      'onde',
      'localizacao',
      'horario',
      'horario de atendimento',
      'whatsapp',
      'falar',
      'falar com',
      'alguem',
      'ligar',
      'telefonar',
      'phone',
      'address',
      'location',
      'hours',
      'opening',
    ],
    build: contactReply,
  },
  {
    id: 'proposal',
    keywords: [
      'proposta',
      'agendar',
      'consulta',
      'reuniao',
      'marcar',
      'consultoria',
      'diagnostico',
      'book',
      'meeting',
      'appointment',
      'demo',
    ],
    build: (locale) => ({
      text:
        locale === 'pt'
          ? 'Combinamos uma consulta inicial sem compromisso. Preencha o formulário de contactos ou fale connosco pelo WhatsApp e respondemos no mesmo dia útil.'
          : 'We arrange an initial no-obligation consultation. Fill in the contact form or reach us on WhatsApp and we reply the same business day.',
      links: [
        {
          label: locale === 'pt' ? 'Agendar consulta' : 'Book a consultation',
          href: `/${locale}/${locale === 'pt' ? 'contactos' : 'contact'}#contacto`,
        },
        {
          label: locale === 'pt' ? 'Abrir WhatsApp' : 'Open WhatsApp',
          href: company.whatsappHref,
          external: true,
        },
      ],
    }),
  },
  {
    id: 'about',
    keywords: [
      'sobre',
      'sobre a cts',
      'empresa',
      'historia',
      'quem sao',
      'ceo',
      'mauro',
      'experiencia',
      'desde quando',
      'about',
      'company',
      'history',
    ],
    build: (locale) => ({
      text: companyInfo(locale),
      links: [
        {
          label: locale === 'pt' ? 'Conhecer a CTS' : 'Get to know CTS',
          href: `/${locale}/${locale === 'pt' ? 'sobre' : 'about'}`,
        },
      ],
    }),
  },
  {
    id: 'thanks',
    keywords: ['obrigado', 'obrigada', 'thanks', 'thank you', 'valeu', 'agradeco'],
    build: (locale) => ({
      text:
        locale === 'pt'
          ? 'De nada! Se precisar de mais alguma coisa, estou por aqui.'
          : 'You are welcome! If you need anything else, I am here.',
    }),
  },
  {
    id: 'bye',
    keywords: ['adeus', 'ate logo', 'ate breve', 'bye', 'goodbye', 'see you'],
    build: (locale) => ({
      text:
        locale === 'pt'
          ? 'Até logo! A equipa da CTS está disponível em horário de expediente.'
          : 'Goodbye! The CTS team is available during business hours.',
    }),
  },
];

const FALLBACK = (locale: Locale): ChatReply => ({
  text:
    locale === 'pt'
      ? 'Ainda não tenho uma resposta para isso. Posso ajudar com serviços de contabilidade e fiscalidade, ERP Primavera, auditoria, formação profissional ou contactos. Escolha uma opção ou fale com a nossa equipa.'
      : 'I do not have an answer for that yet. I can help with accounting and tax services, Primavera ERP, audit, professional training or contacts. Pick an option or talk to our team.',
  suggestions:
    locale === 'pt'
      ? ['Serviços', 'Formação profissional', 'Pedir proposta', 'Contactos']
      : ['Services', 'Professional training', 'Request a proposal', 'Contacts'],
});

/** Resposta determinística a partir do corpus local (sem modelos externos). */
export function answerMessage(message: string, locale: Locale): ChatReply {
  const normalized = normalize(message);
  if (!normalized) return FALLBACK(locale);

  let best: Intent | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const value = score(normalized, intent.keywords);
    if (value > bestScore) {
      best = intent;
      bestScore = value;
    }
  }

  return best ? best.build(locale) : FALLBACK(locale);
}

export const CHAT_SUGGESTIONS = {
  pt: ['Serviços', 'Formação profissional', 'Pedir proposta', 'Contactos'],
  en: ['Services', 'Professional training', 'Request a proposal', 'Contacts'],
} as const;
