import type { Locale } from '@/i18n/routing';

/**
 * Secções do site público com slug por locale (docs/06).
 */
export const SECTIONS = {
  about: { pt: 'sobre', en: 'about' },
  services: { pt: 'servicos', en: 'services' },
  training: { pt: 'formacao', en: 'training' },
  news: { pt: 'noticias', en: 'news' },
  contact: { pt: 'contactos', en: 'contact' },
} as const;

export type SectionKey = keyof typeof SECTIONS;

export function sectionPath(locale: Locale, key: SectionKey): string {
  return `/${locale}/${SECTIONS[key][locale]}`;
}

/** Resolve um slug de URL à sua secção, ou null. */
export function resolveSection(locale: Locale, slug: string): SectionKey | null {
  const entries = Object.entries(SECTIONS) as [SectionKey, Record<Locale, string>][];
  return entries.find(([, slugs]) => slugs[locale] === slug)?.[0] ?? null;
}

export function allSectionParams() {
  const locales: Locale[] = ['pt', 'en'];
  return locales.flatMap((locale) =>
    (Object.keys(SECTIONS) as SectionKey[]).map((key) => ({
      locale,
      section: SECTIONS[key][locale],
    })),
  );
}
