import { CourseDetailPage, courseMetadata } from '@/components/views/course-detail-page';
import type { Locale } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (locale !== 'pt') return {};
  return courseMetadata(locale, slug);
}

export default async function FormacaoDetalhePage({ params }: Props) {
  const { locale, slug } = await params;
  if (locale !== 'pt') notFound();
  setRequestLocale(locale);
  return <CourseDetailPage locale={locale} slug={slug} />;
}
