import type { MetadataRoute } from 'next';

const name = 'CTS Consultoria Empresarial';
const shortName = 'CTS';
const description =
  'Contabilidade, consultoria fiscal, implementação de ERP e formação profissional em Luanda, Angola. Fornecedor homologado pela ANPG.';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name,
    short_name: shortName,
    description,
    id: '/pt',
    start_url: '/pt',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait-primary',
    background_color: '#0B1B2F',
    theme_color: '#0054AE',
    lang: 'pt',
    dir: 'ltr',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Formação Profissional',
        short_name: 'Formação',
        url: '/pt/formacao',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Contactos',
        short_name: 'Contactos',
        url: '/pt/contactos',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Notícias e Recursos',
        short_name: 'Notícias',
        url: '/pt/noticias',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
