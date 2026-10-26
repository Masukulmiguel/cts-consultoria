import type { Metadata } from 'next';

const manifest: Metadata = {
  name: 'CTS Consultoria Empresarial',
  short_name: 'CTS Consultoria',
  description: 'Consultoria Empresarial & Gestão de Negócios em Luanda, Angola',
  theme_color: '#0054AE',
  background_color: '#000000',
  display: 'standalone',
  orientation: 'portrait',
  icons: [
    {
      // @ts-ignore - Type definition issue with src property
      src: '/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      // @ts-ignore - Type definition issue with src property
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      // @ts-ignore - Type definition issue with src property
      src: '/icons/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  ],
};

export default manifest;
