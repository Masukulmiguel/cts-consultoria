'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

const LABELS: Record<string, string> = { pt: 'PT', en: 'EN' };

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const other = locale === 'pt' ? 'en' : 'pt';
  const switched = pathname.replace(new RegExp(`^/${locale}`), `/${other}`);

  return (
    <button
      type="button"
      aria-label={t('language')}
      onClick={() => router.push(switched)}
      className="rounded-full border border-white/40 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
    >
      {LABELS[other]}
    </button>
  );
}
