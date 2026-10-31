import { Clock } from 'lucide-react';

const PLANNED: Record<string, string> = {
  paginas: 'Gestão de páginas institucionais com blocos editáveis.',
  menus: 'Edição das menus de navegação, rodapé e mega menu.',
  seo: 'Metadados, canonical, Open Graph e sitemaps por página.',
  multimedia: 'Biblioteca de imagens e ficheiros do site.',
  parceiros: 'Parceiros institucionais e homologações.',
  galeria: 'Galerias de fotos das formações e eventos.',
  pedidos: 'Pedidos de serviço recebidos pelo site.',
  turmas: 'Turmas, datas, vagas e inscrições.',
  panfletos: 'Panfletos e materiais das formações.',
  inscricoes: 'Inscrições dos formandos por estado.',
  pagamentos: 'Pagamentos e validação de recibos.',
  clientes: 'Base de clientes e histórico de contrato.',
  contactos: 'Mensagens recebidas pelo formulário de contacto.',
  funcionarios: 'Equipa interna e permissões de acesso.',
  perfis: 'Perfis de acesso e matriz de permissões.',
  conversas: 'Histórico de conversas do assistente virtual.',
  conhecimento: 'Base de conhecimento e respostas do assistente.',
  visitas: 'Tráfego, visitas e páginas mais consultadas.',
  trafego: 'Origem do tráfego e campanhas.',
  empresa: 'Identidade da empresa, morada e contactos.',
  'redes-sociais': 'Perfis oficiais nas redes sociais.',
  integracoes: 'Integrações com ERP, faturação e serviços externos.',
};

export default async function PlannedAdminPage({
  params,
}: {
  params: Promise<{ locale: string; path: string[] }>;
}) {
  const { path } = await params;
  const slug = path[path.length - 1] ?? '';
  const description = PLANNED[slug];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-2xs font-semibold uppercase tracking-[0.22em] text-primary-300">
          Em preparação
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">{path.join(' / ')}</h1>
      </header>

      <div className="rounded-xl border border-[#1c2c49] bg-[#0d1729] p-8">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-600/15 text-primary-300">
          <Clock size={20} />
        </span>
        <p className="mt-5 font-display text-lg font-semibold text-white">
          {description ?? 'Esta área do painel entra em uma fase posterior.'}
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
          A área já está preparada na navegação e com controlo de permissões. Os conteúdos editáveis
          — serviços, cursos, notícias e FAQs — estão disponíveis no menu Conteúdos.
        </p>
      </div>
    </div>
  );
}
