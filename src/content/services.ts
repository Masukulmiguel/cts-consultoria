/**
 * Conteúdo institucional REAL da CTS — migrado do website actual (docs/02).
 * Nenhum dado inventado. Traduções EN são traduções do conteúdo confirmado.
 */

export type Localized = { pt: string; en: string };

export const company = {
  name: 'CTS Consultoria Empresarial & Gestão de Negócios',
  shortName: 'CTS',
  since: 2016,
  address: 'Rua Avenida Brasil, Casa n° 162 A, 1.º Andar, Rangel, Luanda, Angola',
  addressNote: {
    pt: 'De frente ao Ministério da Acção Social (MASFAMU)',
    en: 'Opposite the Ministry of Social Action (MASFAMU)',
  } satisfies Localized,
  phone: '+244 992 771 895',
  phoneHref: 'tel:+244992771895',
  whatsapp: '+244 958 893 484',
  whatsappHref: 'https://wa.me/244958893484',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=Rua+Avenida+Brasil+Casa+162+A+Rangel+Luanda+Angola',
  email: 'geral@consultoriacts.com', // pendente de confirmação (docs/23 Q6) — usado apenas no formulário interno
  site: 'https://www.consultoriacts.com',
  ceo: {
    name: 'Mauro Torres Gonçalves',
    role: {
      pt: 'CEO · Contabilista e Consultor Fiscal',
      en: 'CEO · Accountant and Tax Consultant',
    } satisfies Localized,
    photo: '/ceo-mauro-torres-goncalves.png',
  },
};

export const tagline = {
  pt: 'Garantir o cumprimento das Obrigações Contabilísticas e Fiscais com as melhores práticas de Gestão.',
  en: 'Ensuring compliance with Accounting and Tax obligations through best Management practices.',
} satisfies Localized;

export const taglineLong = {
  pt: 'A CTS Consultoria Empresarial & Gestão de Negócios garante a qualidade rigorosa da informação financeira, com ênfase na conformidade tributária perante a AGT e otimização da gestão empresarial em Angola.',
  en: 'CTS Business Consulting & Management ensures rigorous quality of financial information, with an emphasis on tax compliance with the AGT and business management optimization in Angola.',
} satisfies Localized;

export const mission = {
  pt: 'Garantir a qualidade da informação financeira dos clientes, pela prestação dos nossos serviços, com ênfase no cumprimento das obrigações contabilísticas e fiscais melhorando o ambiente da gestão empresarial...',
  en: 'To guarantee the quality of our clients’ financial information through our services, with an emphasis on complying with accounting and tax obligations, improving the business management environment...',
} satisfies Localized;

export const about = {
  title: {
    pt: 'Compromisso com a Excelência e Governança em Angola',
    en: 'A Commitment to Excellence and Governance in Angola',
  } satisfies Localized,
  paragraphs: [
    {
      pt: 'Fundada em 2016 em Luanda, a CTS Consultoria Empresarial consolidou-se como referência na estruturação contábil, planeamento fiscal e gestão empresarial no mercado angolano.',
      en: 'Founded in 2016 in Luanda, CTS Business Consulting has established itself as a reference in accounting structure, tax planning and business management in the Angolan market.',
    },
    {
      pt: 'Atuamos com foco na blindagem fiscal e integridade documental, permitindo que os gestores e empresários tomem decisões com base em dados fidedignos, balancetes consistentes e plena conformidade legal.',
      en: 'We operate with a focus on tax protection and documentary integrity, enabling managers and entrepreneurs to make decisions based on reliable data, consistent trial balances and full legal compliance.',
    },
  ] satisfies Localized[],
};

export const facts = [
  {
    label: { pt: 'Fundação', en: 'Founded' } satisfies Localized,
    value: { pt: '2016, Luanda', en: '2016, Luanda' } satisfies Localized,
  },
  {
    label: { pt: 'Equipa', en: 'Team' } satisfies Localized,
    value: { pt: '11 a 50 especialistas', en: '11 to 50 specialists' } satisfies Localized,
  },
  {
    label: { pt: 'Certificação', en: 'Certification' } satisfies Localized,
    value: { pt: 'ANPG — Homologado', en: 'ANPG — Certified' } satisfies Localized,
  },
  {
    label: { pt: 'Sede', en: 'Headquarters' } satisfies Localized,
    value: { pt: 'Rangel, Luanda', en: 'Rangel, Luanda' } satisfies Localized,
  },
];

export const anpg = {
  title: { pt: 'Certificação Oficial ANPG', en: 'Official ANPG Certification' } satisfies Localized,
  subtitle: {
    pt: 'Agência Nacional de Petróleo e Gás',
    en: 'National Agency of Oil, Gas and Biofuels',
  } satisfies Localized,
  text: {
    pt: 'Auditabilidade e rigor para o setor de Petróleo e Gás. Aptos para atender exigências de conteúdo local e compliance da indústria petrolífera, com habilitação técnica para fornecimento de serviços de contabilidade, fiscalidade e auditoria especializada.',
    en: 'Auditability and rigor for the Oil & Gas sector. Qualified to meet local content requirements and petroleum industry compliance, with technical qualification for the supply of accounting, tax and specialized audit services.',
  } satisfies Localized,
  quote: {
    pt: 'É com grande satisfação que anunciamos que somos certificados pela AGÊNCIA NACIONAL DE PETRÓLEO E GÁS - ANPG. Um processo bastante rigoroso e burocrático mas que valeu a pena e nos orgulhamos em aumentar o nosso Core Business e mercados de atuação.',
    en: 'We are pleased to announce that we are certified by the NATIONAL AGENCY OF OIL AND GAS - ANPG. A rigorous and bureaucratic process that was worth it, and we are proud to expand our core business and markets.',
  } satisfies Localized,
};

export type Service = {
  slug: { pt: string; en: string };
  title: Localized;
  category: Localized;
  summary: Localized;
  bullets: Localized[];
};

/** Serviços reais publicados no website actual (docs/02 §3). */
export const services: Service[] = [
  {
    slug: { pt: 'contabilidade-geral', en: 'general-accounting' },
    title: { pt: 'Contabilidade Geral & Financeira', en: 'General & Financial Accounting' },
    category: { pt: 'Contabilidade', en: 'Accounting' },
    summary: {
      pt: 'Organização, escrituração e fecho de contas de acordo com as Normas e o Plano Geral de Contabilidade (PGC-NIRF) em Angola.',
      en: 'Organization, bookkeeping and year-end closing in accordance with the Standards and the General Plan of Accounts (PGC-NIRF) in Angola.',
    },
    bullets: [
      {
        pt: 'Elaboração de Balancetes e Demonstrações Financeiras (Balanço, DR, Fluxo de Caixa)',
        en: 'Preparation of trial balances and Financial Statements (Balance Sheet, P&L, Cash Flow)',
      },
      {
        pt: 'Reconciliações bancárias e regularizações complexas de contas correntes',
        en: 'Bank reconciliations and complex current account adjustments',
      },
      {
        pt: 'Elaboração das Notas às Contas e Relatório de Gestão',
        en: 'Preparation of Notes to the Accounts and Management Report',
      },
    ],
  },
  {
    slug: { pt: 'consultoria-fiscal', en: 'tax-consulting' },
    title: { pt: 'Consultoria e Planeamento Fiscal', en: 'Tax Consulting and Planning' },
    category: { pt: 'Fiscalidade', en: 'Tax' },
    summary: {
      pt: 'Cumprimento rigoroso das obrigações tributárias angolanas perante a AGT, prevenindo multas e otimizando a carga fiscal.',
      en: 'Rigorous compliance with Angolan tax obligations before the AGT, preventing fines and optimizing the tax burden.',
    },
    bullets: [
      {
        pt: 'Apuramento e submissão: SELO, IVA, IRT, IP, II, IEC e Retenções',
        en: 'Calculation and filing: SELO, VAT, IRT, IP, II, IEC and Withholdings',
      },
      {
        pt: 'Preenchimento e entrega da Declaração Modelo 1 da AGT',
        en: 'Preparation and submission of the AGT Model 1 Declaration',
      },
      {
        pt: 'Dossier Contabilístico e Fiscal pronto para inspeções',
        en: 'Accounting and Tax Dossier ready for inspections',
      },
    ],
  },
  {
    slug: { pt: 'erp-primavera', en: 'primavera-erp' },
    title: { pt: 'ERP PRIMAVERA v10', en: 'PRIMAVERA v10 ERP' },
    category: { pt: 'Software ERP', en: 'ERP Software' },
    summary: {
      pt: 'Parametrização, rotinas operacionais e fecho de contas no software de gestão de referência em Angola.',
      en: 'Configuration, operational routines and year-end closing in the reference management software in Angola.',
    },
    bullets: [
      {
        pt: 'Módulos integrados: Compras, Vendas, Contabilidade, Tesouraria e RH',
        en: 'Integrated modules: Purchasing, Sales, Accounting, Treasury and HR',
      },
      {
        pt: 'Fecho e reabertura anual de exercício económico',
        en: 'Annual closing and reopening of the financial year',
      },
      {
        pt: 'Extração do SAF-T AO e conferência fiscal',
        en: 'SAF-T AO extraction and tax reconciliation',
      },
    ],
  },
  {
    slug: { pt: 'estudo-de-viabilidade', en: 'feasibility-study' },
    title: {
      pt: 'Estudo de Viabilidade Económica & Financeira',
      en: 'Economic & Financial Feasibility Study',
    },
    category: { pt: 'Estratégia', en: 'Strategy' },
    summary: {
      pt: 'Avaliação criteriosa de investimentos, cálculo de VAL, TIR e Payback para obtenção de financiamento e atração de investidores.',
      en: 'Rigorous investment assessment, NPV, IRR and Payback calculations to obtain financing and attract investors.',
    },
    bullets: [
      {
        pt: 'Projeções de tesouraria, demonstração de resultados previsional e balanço',
        en: 'Cash-flow projections, forecast income statement and balance sheet',
      },
      {
        pt: 'Análise de sensibilidade e cenários de risco macroeconómico',
        en: 'Sensitivity analysis and macroeconomic risk scenarios',
      },
      {
        pt: 'Dossiê executivo para bancos e parceiros comerciais',
        en: 'Executive dossier for banks and commercial partners',
      },
    ],
  },
  {
    slug: { pt: 'auditoria-financeira', en: 'financial-audit' },
    title: {
      pt: 'Auditoria Financeira & Controlo Interno',
      en: 'Financial Audit & Internal Control',
    },
    category: { pt: 'Auditoria', en: 'Audit' },
    summary: {
      pt: 'Exame detalhado da fidedignidade das contas, revisão de controlos internos e salvaguarda do património empresarial.',
      en: 'Detailed examination of the reliability of accounts, review of internal controls and safeguarding of business assets.',
    },
    bullets: [
      {
        pt: 'Testes substantivos a contas de terceiros, imobilizado e caixa',
        en: 'Substantive testing of third-party accounts, fixed assets and cash',
      },
      {
        pt: 'Relatório de auditoria com recomendações e matriz de risco',
        en: 'Audit report with recommendations and risk matrix',
      },
      {
        pt: 'Suporte a processos de certificação e auditorias externas',
        en: 'Support for certification processes and external audits',
      },
    ],
  },
  {
    slug: { pt: 'gestao-rh-inss', en: 'hr-inss-management' },
    title: { pt: 'Gestão de RH, Salários & INSS', en: 'HR, Payroll & INSS Management' },
    category: { pt: 'Recursos Humanos', en: 'Human Resources' },
    summary: {
      pt: 'Processamento salarial, emissão de recibos, apuramento de IRT e gestão integral das folhas perante o Portal do INSS.',
      en: 'Payroll processing, payslip issuance, IRT calculation and full payroll management through the INSS Portal.',
    },
    bullets: [
      {
        pt: 'Cálculo de remunerações, horas extras e subsídios legais',
        en: 'Calculation of remuneration, overtime and legal allowances',
      },
      {
        pt: 'Submissão de mapas e folhas no Portal do INSS Angola',
        en: 'Submission of statements and payroll at the INSS Angola Portal',
      },
      {
        pt: 'Gestão documental de pessoal e contratos laborais',
        en: 'Personnel documentation and employment contract management',
      },
    ],
  },
];

/** Famílias de formação reais, segundo os panfletos (docs/02 Anexo B). Datas/preços por confirmar. */
export const trainingFamilies: { title: Localized; description: Localized }[] = [
  {
    title: {
      pt: 'Contabilidade e Fiscalidade (Primavera v10 · Portal AGT)',
      en: 'Accounting and Tax (Primavera v10 · AGT Portal)',
    },
    description: {
      pt: 'Formação prática em níveis Júnior, Intermédio e Sénior, com forte aposta no software Primavera v10 e no Portal da AGT. Certificados homologados pelo INEFOP e estágios profissionais disponíveis.',
      en: 'Practical training at Junior, Intermediate and Senior levels, with a strong focus on Primavera v10 software and the AGT Portal. Certificates homologated by INEFOP and professional internships available.',
    },
  },
  {
    title: {
      pt: 'Gestão de Recursos Humanos + Primavera v10',
      en: 'Human Resources Management + Primavera v10',
    },
    description: {
      pt: 'Técnicas de gestão de recursos humanos integradas com o software Primavera v10, com certificados homologados pelo INEFOP.',
      en: 'HR management techniques integrated with Primavera v10 software, with INEFOP-homologated certificates.',
    },
  },
  {
    title: { pt: 'Treinamento de Fecho de Contas', en: 'Year-End Closing Training' },
    description: {
      pt: 'Treinamento intensivo de fecho de contas, em formato de semana intensiva ou sábados, com coffee break.',
      en: 'Intensive year-end closing training, in an intensive week or Saturday format, with coffee break.',
    },
  },
];
