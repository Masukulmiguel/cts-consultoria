import { TrafficDonut, VisitsAreaChart } from '@/components/admin/dashboard-charts';
import { KpiCard } from '@/components/admin/kpi-card';
import { getDashboardData } from '@/lib/admin/dashboard-data';
import { requireUser } from '@/lib/rbac';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  ClipboardList,
  CreditCard,
  Eye,
  GraduationCap,
  Newspaper,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const QUICK_ACTIONS = [
  {
    label: 'Adicionar Serviço',
    hint: 'Criar novo serviço',
    href: '/pt/admin/conteudos/servicos',
    icon: Briefcase,
  },
  {
    label: 'Novo Curso',
    href: '/pt/admin/formacao/cursos',
    hint: 'Registar curso',
    icon: GraduationCap,
  },
  {
    label: 'Publicar Notícia',
    href: '/pt/admin/conteudos/noticias',
    hint: 'Escrever notícia',
    icon: Newspaper,
  },
  {
    label: 'Ver Inscrições',
    href: '/pt/admin/inscricoes',
    hint: 'Lista completa',
    icon: ClipboardList,
  },
  {
    label: 'Ver Pagamentos',
    href: '/pt/admin/pagamentos',
    hint: 'Lista completa',
    icon: CreditCard,
  },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default async function AdminDashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData();
  const now = new Date();
  const firstName = (user.name ?? 'Administrador').split(' ')[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Bem-vindo de volta, {firstName}!
          </h1>
          <p className="mt-1 text-sm text-[#8494b0]">
            Aqui está um resumo da atividade da CTS Consultoria.
          </p>
        </div>
        <div className="text-right">
          <p className="inline-flex items-center rounded-lg border border-[#1c2c49] bg-[#0d1729] px-3 py-1.5 text-xs font-medium text-white">
            {formatDate(now)}
          </p>
          <p className="mt-1 text-[11px] text-[#6b7d99]">Última atualização: {formatTime(now)}</p>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {data.kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            deltaUp={kpi.deltaUp}
            caption={kpi.caption}
            icon={kpi.icon}
            color={kpi.color}
            spark={kpi.spark}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr_1fr]">
        <article className="admin-surface flex flex-col p-5">
          <header className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Eye size={16} className="text-[#2e7be8]" />
                Visitas ao Website
              </h2>
              <p className="mt-0.5 text-[11px] text-[#6b7d99]">Últimos 7 dias</p>
            </div>
            <span className="rounded-md border border-[#1c2c49] px-2 py-1 text-[11px] text-[#a8b6cf]">
              Últimos 7 dias
            </span>
          </header>
          <div className="mt-4 h-56">
            <VisitsAreaChart data={data.visits} />
          </div>
        </article>

        <article className="admin-surface flex flex-col p-5">
          <header>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2e7be8]" />
              Origem do Tráfego
            </h2>
            <p className="mt-0.5 text-[11px] text-[#6b7d99]">Últimos 7 dias</p>
          </header>
          <div className="mt-4 flex-1">
            <TrafficDonut data={data.traffic} centerLabel="Total" />
          </div>
        </article>

        <article className="admin-surface flex flex-col p-5">
          <header>
            <h2 className="text-sm font-semibold text-white">Atividade Recente</h2>
            <p className="mt-0.5 text-[11px] text-[#6b7d99]">Últimas 24 horas</p>
          </header>
          <ul className="mt-4 space-y-3">
            {data.activity.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex gap-3 rounded-lg p-1.5 transition-colors hover:bg-[#111e35]"
                >
                  <span
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${item.color}22`, color: item.color }}
                  >
                    <BookOpen size={14} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-medium text-white group-hover:text-[#6fa6de]">
                      {item.title}
                    </span>
                    <span className="block truncate text-[11px] text-[#8494b0]">
                      {item.description}
                    </span>
                    <span className="block text-[10px] text-[#5c6f8d]">{item.time}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <article className="admin-surface p-5">
          <header className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Cursos em Destaque</h2>
            <Link
              href="/pt/admin/formacao/cursos"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#6fa6de] hover:text-white"
            >
              Ver todos <ArrowRight size={13} />
            </Link>
          </header>
          <ul className="mt-4 space-y-2.5">
            {data.featuredCourses.map((course) => (
              <li
                key={course.id}
                className="flex items-center gap-3 rounded-lg border border-[#16233d] bg-[#0d1729] p-2.5"
              >
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md">
                  <Image src={course.image} alt="" fill sizes="44px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-white">
                    {course.title}
                  </span>
                  <span className="block truncate text-[11px] text-[#8494b0]">{course.meta}</span>
                </span>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${course.badgeClass}`}
                >
                  {course.badge}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-surface flex flex-col p-5">
          <header className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Inscrições por Estado</h2>
            <Link
              href="/pt/admin/inscricoes"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#6fa6de] hover:text-white"
            >
              Ver todos <ArrowRight size={13} />
            </Link>
          </header>
          <div className="mt-4 flex-1">
            <TrafficDonut
              data={data.enrollments.map((slice) => ({ ...slice, value: slice.value }))}
              centerLabel="Total"
            />
          </div>
        </article>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="admin-surface-2 group flex items-center gap-3 p-3.5 transition-colors hover:border-[#2e7be8]"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(46,123,232,0.14)] text-[#6fa6de] transition-colors group-hover:bg-[#0054ae] group-hover:text-white">
              <action.icon size={16} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-white">
                {action.label}
              </span>
              <span className="block truncate text-[11px] text-[#6b7d99]">{action.hint}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#1c2c49] bg-gradient-to-r from-[#0d1729] to-[#111e35] p-5">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#0054ae] text-lg font-bold text-white">
            C
          </span>
          <div>
            <p className="font-display text-base font-bold text-white">
              CTS Consultoria Empresarial & Gestão de Negócios
            </p>
            <p className="text-[12px] text-[#8494b0]">Juntos pelo seu crescimento</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-[12px] text-[#8494b0]">
          <span>
            <strong className="block text-lg text-white">{data.totals.services}</strong> Serviços
          </span>
          <span>
            <strong className="block text-lg text-white">{data.totals.contacts}</strong> Contactos
          </span>
          <span>
            <strong className="block text-lg text-white">{data.totals.users}</strong> Utilizadores
          </span>
          <span>
            <strong className="block text-lg text-white">{data.totals.enrollments}</strong>{' '}
            Inscrições
          </span>
          <span>
            <strong className="block text-lg text-white">{data.totals.conversations}</strong>{' '}
            Conversas
          </span>
        </div>
      </section>
    </div>
  );
}
