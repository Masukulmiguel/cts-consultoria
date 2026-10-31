import type { Locale } from '@/i18n/routing';
import { listRows } from '@/lib/admin/content-repo';
import { RESOURCES, isResourceKey } from '@/lib/admin/resources';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ResourceListPage({
  params,
}: {
  params: Promise<{ locale: Locale; resource: string }>;
}) {
  const { locale, resource } = await params;
  if (!isResourceKey(resource)) notFound();
  const def = RESOURCES[resource];
  const rows = await listRows(resource);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.22em] text-primary-300">
            Conteúdos
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white">{def.label}</h1>
          <p className="mt-1 text-sm text-white/50">
            {rows.length} registo{rows.length === 1 ? '' : 's'} · editar o que aparece no site
          </p>
        </div>
        <Link
          href={`/${locale}/admin/${resource}/novo`}
          className="inline-flex min-h-11 items-center rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
        >
          Novo {def.singular}
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-[#1c2c49]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#111e35] text-xs tracking-wider text-white/50 uppercase">
            <tr>
              {def.columns.map((column) => (
                <th key={column.name} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c2c49] bg-[#0d1729]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={def.columns.length + 1}
                  className="px-4 py-10 text-center text-sm text-white/45"
                >
                  Ainda não existem registos. Crie o primeiro {def.singular}.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-[#111e35]">
                  {def.columns.map((column) => (
                    <td key={column.name} className="px-4 py-3 text-white/80">
                      {column.name === 'published'
                        ? row.published === true
                          ? 'Sim'
                          : 'Não'
                        : column.name === 'publishedAt'
                          ? row.publishedAt instanceof Date
                            ? row.publishedAt.toLocaleDateString('pt-PT')
                            : ''
                          : String(row[column.name] ?? '—')}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/${locale}/admin/${resource}/${row.id}`}
                      className="inline-flex rounded-md border border-[#1c2c49] px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:border-primary-500 hover:text-white"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
