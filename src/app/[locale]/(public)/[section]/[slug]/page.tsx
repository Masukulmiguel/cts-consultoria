import { ServiceDetailView } from '@/components/views/service-detail-view';
import { resolveSection } from '@/content/routes';
import { services } from '@/content/services';
import type { Locale } from '@/i18n/routing';
import { getPublicServices } from '@/lib/content-db';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ locale: Locale; section: string; slug: string }> };

/** Os conteúdos vêm da base de dados; revalida a cada 60 segundos. */
export const revalidate = 60;

/** Apenas os serviços têm páginas de detalhe. */
export function generateStaticParams() {
  return services.flatMap((s) => [
    { locale: 'pt', section: 'servicos', slug: s.slug.pt },
    { locale: 'en', section: 'services', slug: s.slug.en },
  ]);
}

/** Serviços criados no painel são renderizados a pedido. */
export const dynamicParams = true;

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const list = await getPublicServices();
  const service = list.find((s) => s.slug[locale] === slug);
  if (!service) return {};
  return { title: service.title[locale], description: service.summary[locale] };
}

export default async function ServicePage({ params }: Props) {
  const { locale, section, slug } = await params;
  const key = resolveSection(locale, section);
  if (key !== 'services') notFound();

  const list = await getPublicServices();
  const service = list.find((s) => s.slug[locale] === slug);
  if (!service) notFound();
  setRequestLocale(locale);

  return <ServiceDetailView locale={locale} slug={slug} services={list} />;
}
