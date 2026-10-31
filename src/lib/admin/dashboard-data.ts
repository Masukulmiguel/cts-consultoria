import { services } from '@/content/services';
import { prisma } from '@/lib/prisma';

export type DashboardData = {
  visits: { label: string; value: number }[];
  traffic: { name: string; value: number; color: string }[];
  enrollments: { name: string; value: number; color: string }[];
  kpis: {
    label: string;
    value: string;
    delta: string;
    deltaUp: boolean;
    caption: string;
    color: string;
    icon: 'eye' | 'users' | 'userCheck' | 'mail' | 'fileText' | 'graduationCap';
    spark: { label: string; value: number }[];
  }[];
  activity: {
    id: string;
    title: string;
    description: string;
    time: string;
    color: string;
    href: string;
  }[];
  featuredCourses: {
    id: string;
    title: string;
    meta: string;
    badge: string;
    badgeClass: string;
    image: string;
  }[];
  totals: {
    contacts: number;
    unreadContacts: number;
    users: number;
    services: number;
    enrollments: number;
    conversations: number;
  };
};

const WEEK_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function seedSeries(base: number, factor: number, offset: number) {
  return WEEK_LABELS.map((label, index) => ({
    label,
    value: Math.round(base + Math.sin((index + offset) * 1.1) * factor + index * factor * 0.4),
  }));
}

export async function getDashboardData(): Promise<DashboardData> {
  const [contacts, unreadContacts, users] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.user.count(),
  ]);

  const enrollments = 0;
  const conversations = 0;

  return {
    visits: seedSeries(980, 130, 1),
    traffic: [
      { name: 'Pesquisa Orgânica', value: 42.5, color: '#2e7be8' },
      { name: 'Direto', value: 24.8, color: '#7c5ce6' },
      { name: 'Redes Sociais', value: 18.7, color: '#16a36a' },
      { name: 'Referidos', value: 9.2, color: '#e2912b' },
      { name: 'Email', value: 5.8, color: '#c445a8' },
    ],
    enrollments: [
      { name: 'Aprovadas', value: 42, color: '#16a36a' },
      { name: 'Em análise', value: 28, color: '#2e7be8' },
      { name: 'A aguardar pagamento', value: 16, color: '#e2912b' },
      { name: 'Rejeitadas', value: 11, color: '#e41620' },
      { name: 'Canceladas', value: 5, color: '#6b7794' },
    ],
    kpis: [
      {
        label: 'Visitas ao Website',
        value: '12.458',
        delta: '12%',
        deltaUp: true,
        caption: 'vs. período anterior',
        color: '#2e7be8',
        icon: 'eye',
        spark: seedSeries(120, 24, 2),
      },
      {
        label: 'Visitantes Únicos',
        value: '8.732',
        delta: '10%',
        deltaUp: true,
        caption: 'vs. período anterior',
        color: '#7c5ce6',
        icon: 'users',
        spark: seedSeries(90, 20, 4),
      },
      {
        label: 'Pedidos de Contacto',
        value: String(contacts),
        delta: '18%',
        deltaUp: true,
        caption: `${unreadContacts} por ler`,
        color: '#16a36a',
        icon: 'mail',
        spark: seedSeries(40, 12, 1),
      },
      {
        label: 'Solicitações de Serviços',
        value: '24',
        delta: '8%',
        deltaUp: true,
        caption: 'vs. período anterior',
        color: '#e2912b',
        icon: 'fileText',
        spark: seedSeries(18, 6, 3),
      },
      {
        label: 'Inscrições em Cursos',
        value: String(enrollments),
        delta: '22%',
        deltaUp: true,
        caption: 'vs. período anterior',
        color: '#c445a8',
        icon: 'graduationCap',
        spark: seedSeries(14, 5, 5),
      },
    ],
    activity: [
      {
        id: 'a1',
        title: 'Pedido de serviço recebido',
        description: 'Contabilidade Geral & Financeira',
        time: 'Há 8 minutos',
        color: '#2e7be8',
        href: '/pt/admin/clientes/contactos',
      },
      {
        id: 'a2',
        title: 'Novo contacto pelo site',
        description: 'Formulário de contacto — Luanda',
        time: 'Há 42 minutos',
        color: '#16a36a',
        href: '/pt/admin/clientes/contactos',
      },
      {
        id: 'a3',
        title: 'Pagamento validado',
        description: 'Formação Prática — Sénior',
        time: 'Há 2 horas',
        color: '#e2912b',
        href: '/pt/admin/pagamentos',
      },
      {
        id: 'a4',
        title: 'Mensagem no chat',
        description: 'Dúvida sobre cursos de Primavera',
        time: 'Há 3 horas',
        color: '#7c5ce6',
        href: '/pt/admin/chatbot/conversas',
      },
      {
        id: 'a5',
        title: 'Inscrição aprovada',
        description: 'Formação — 250.000 Kz',
        time: 'Há 5 horas',
        color: '#c445a8',
        href: '/pt/admin/inscricoes',
      },
    ],
    featuredCourses: [
      {
        id: 'c1',
        title: 'Gestão de RH',
        meta: 'Formação · 1 mês · Profissional',
        badge: 'Mais procurado',
        badgeClass: 'bg-[rgba(22,163,106,0.16)] text-[#3ddc97]',
        image: '/training/flyer-7.jpg',
      },
      {
        id: 'c2',
        title: 'Contabilidade e Fiscalidade',
        meta: 'Formação · 18x · Técnico',
        badge: 'Em destaque',
        badgeClass: 'bg-[rgba(46,123,232,0.16)] text-[#6fa6de]',
        image: '/training/flyer-6.jpg',
      },
      {
        id: 'c3',
        title: 'Contabilidade e Fiscalidade',
        meta: 'Formação · 16x · Profissional',
        badge: 'Em breve',
        badgeClass: 'bg-[rgba(226,145,43,0.16)] text-[#f0b357]',
        image: '/training/flyer-5.jpg',
      },
    ],
    totals: {
      contacts,
      unreadContacts,
      users,
      services: services.length,
      enrollments,
      conversations,
    },
  };
}
