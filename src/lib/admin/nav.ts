export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
};

export type AdminNavGroup = {
  label: string;
  icon: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    items: [{ label: 'Visão geral', href: '/pt/admin/dashboard', icon: 'LayoutDashboard' }],
  },
  {
    label: 'Conteúdos',
    icon: 'FileText',
    items: [
      { label: 'Serviços', href: '/pt/admin/services', icon: 'Briefcase' },
      { label: 'Cursos', href: '/pt/admin/courses', icon: 'GraduationCap' },
      { label: 'Notícias', href: '/pt/admin/news', icon: 'Newspaper' },
      { label: 'FAQs', href: '/pt/admin/faqs', icon: 'MessageSquare' },
    ],
  },
  {
    label: 'Website',
    icon: 'Globe',
    items: [
      { label: 'Páginas', href: '/pt/admin/website/paginas', icon: 'FileText' },
      { label: 'Menus', href: '/pt/admin/website/menus', icon: 'Menu' },
      { label: 'SEO e metadados', href: '/pt/admin/website/seo', icon: 'Search' },
      { label: 'Multimédia', href: '/pt/admin/website/multimedia', icon: 'Image' },
    ],
  },
  {
    label: 'Serviços',
    icon: 'Briefcase',
    items: [
      { label: 'Todos os serviços', href: '/pt/admin/services', icon: 'Briefcase' },
      { label: 'Pedidos de serviço', href: '/pt/admin/servicos/pedidos', icon: 'ClipboardList' },
    ],
  },
  {
    label: 'Formação',
    icon: 'GraduationCap',
    items: [
      { label: 'Cursos', href: '/pt/admin/courses', icon: 'GraduationCap' },
      { label: 'Turmas e sessões', href: '/pt/admin/formacao/turmas', icon: 'Calendar' },
      { label: 'Panfletos', href: '/pt/admin/formacao/panfletos', icon: 'Presentation' },
    ],
  },
  {
    label: 'Inscrições',
    icon: 'ClipboardList',
    items: [
      { label: 'Todas as inscrições', href: '/pt/admin/inscricoes', icon: 'ClipboardList' },
      { label: 'Aguardam pagamento', href: '/pt/admin/inscricoes?estado=pendente', icon: 'Clock' },
      { label: 'Certificados', href: '/pt/admin/inscricoes/certificados', icon: 'Award' },
    ],
  },
  {
    label: 'Pagamentos',
    icon: 'CreditCard',
    items: [
      { label: 'Todos os pagamentos', href: '/pt/admin/pagamentos', icon: 'CreditCard' },
      { label: 'Por validar', href: '/pt/admin/pagamentos?estado=pendente', icon: 'Clock' },
    ],
  },
  {
    label: 'Clientes',
    icon: 'Users',
    items: [
      { label: 'Base de clientes', href: '/pt/admin/clientes', icon: 'Users' },
      { label: 'Contactos recebidos', href: '/pt/admin/clientes/contactos', icon: 'Mail' },
    ],
  },
  {
    label: 'Funcionários',
    icon: 'UserCog',
    items: [
      { label: 'Equipa', href: '/pt/admin/funcionarios', icon: 'UserCog' },
      { label: 'Perfis e permissões', href: '/pt/admin/funcionarios/perfis', icon: 'ShieldCheck' },
    ],
  },
  {
    label: 'Chatbot',
    icon: 'Bot',
    items: [
      { label: 'Conversas', href: '/pt/admin/chatbot/conversas', icon: 'MessageSquare' },
      { label: 'Base de conhecimento', href: '/pt/admin/chatbot/conhecimento', icon: 'BookOpen' },
    ],
  },
  {
    label: 'Analytics',
    icon: 'TrendingUp',
    items: [
      { label: 'Visitas ao site', href: '/pt/admin/analytics/visitas', icon: 'TrendingUp' },
      { label: 'Origem do tráfego', href: '/pt/admin/analytics/trafego', icon: 'Globe' },
    ],
  },
  {
    label: 'Configurações',
    icon: 'Settings',
    items: [
      {
        label: 'Identidade da empresa',
        href: '/pt/admin/configuracoes/empresa',
        icon: 'Building2',
      },
      { label: 'Redes sociais', href: '/pt/admin/configuracoes/redes-sociais', icon: 'Share2' },
      { label: 'Integrações', href: '/pt/admin/configuracoes/integracoes', icon: 'Plug' },
    ],
  },
];

export const ADMIN_ICON_MAP: Record<string, string> = Object.fromEntries(
  ADMIN_NAV.flatMap((group) => [group.icon, ...group.items.map((item) => item.icon)]).map(
    (name) => [name, name],
  ),
);
