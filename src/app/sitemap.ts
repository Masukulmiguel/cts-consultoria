import { SECTIONS, type SectionKey, allSectionParams } from '@/content/routes';
import { company, services } from '@/content/services';
import type { Locale } from '@/i18n/routing';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.consultoriacts.com';
  const routes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1.0 },
    { url: `${base}/pt`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/en`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ];

  const staticPaths = ['about', 'services', 'training', 'news', 'contact'];

  for (const locale of ['pt', 'en'] as Locale[]) {
    for (const key of staticPaths) {
      const section = SECTIONS[key as SectionKey];
      const slug = section[locale];
      routes.push({
        url: `${base}/${locale}/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  // Service detail pages
  for (const s of services) {
    for (const locale of ['pt', 'en'] as Locale[]) {
      routes.push({
        url: `${base}/${locale}/${SECTIONS.services[locale]}/${s.slug[locale]}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  }

  // Legal pages
  for (const locale of ['pt', 'en'] as Locale[]) {
    routes.push({
      url: `${base}/${locale}/privacidade`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    });
    routes.push({
      url: `${base}/${locale}/termos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    });
  }

  return routes;
}
