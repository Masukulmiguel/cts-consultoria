import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/pt/admin/', '/en/admin/'],
    },
    sitemap: 'https://www.consultoriacts.com/sitemap.xml',
    host: 'https://www.consultoriacts.com',
  };
}
