import { SECTIONS, type SectionKey, sectionPath } from '@/content/routes';
import type { Locale } from '@/i18n/routing';

export { sectionPath, SECTIONS, type Locale };
export type { SectionKey };

/** Alias usado nos componentes de navegação. */
export function localePath(locale: Locale, key: SectionKey | 'home'): string {
  return key === 'home' ? `/${locale}` : sectionPath(locale, key);
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export const SITE_URL = process.env.SITE_URL ?? 'https://www.consultoriacts.com';
