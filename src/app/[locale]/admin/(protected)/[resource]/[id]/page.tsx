import { ResourceForm } from '@/components/admin/resource-form';
import type { Locale } from '@/i18n/routing';
import { getRow } from '@/lib/admin/content-repo';
import { RESOURCES, isResourceKey } from '@/lib/admin/resources';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ResourceEditPage({
  params,
}: {
  params: Promise<{ locale: Locale; resource: string; id: string }>;
}) {
  const { locale, resource, id } = await params;
  if (!isResourceKey(resource)) notFound();
  const def = RESOURCES[resource];
  const record = await getRow(resource, id);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link
          href={`/${locale}/admin/${resource}`}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
        >
          {def.label}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">Editar {def.singular}</h1>
      </header>

      <ResourceForm resource={def} record={record} locale={locale} />
    </div>
  );
}
