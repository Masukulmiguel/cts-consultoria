import { SECTIONS, resolveSection } from '@/content/routes';
import { services } from '@/content/services';
import type { Locale } from '@/i18n/routing';

/**
 * Converte o pathname actual no caminho equivalente noutro idioma.
 * Mapeia a secção E o slug de detalhe (os slugs são diferentes por locale).
 */
export function switchLocalePath(currentLocale: Locale, pathname: string): string {
  const other: Locale = currentLocale === 'pt' ? 'en' : 'pt';
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return `/${other}`;

  const section = resolveSection(currentLocale, segments[1]);
  if (!section) return `/${other}`;

  const target = SECTIONS[section][other];
  if (segments.length === 2) return `/${other}/${target}`;

  const service = services.find((item) => item.slug[currentLocale] === segments[2]);
  if (service) return `/${other}/${target}/${service.slug[other]}`;

  return `/${other}/${target}`;
}
