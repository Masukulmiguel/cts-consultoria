import { type Locale, locales } from '@/i18n/routing';
import { SITE_URL } from '@/lib/site';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter, Source_Serif_4 } from 'next/font/google';
import { notFound } from 'next/navigation';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-source-serif',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#0054ae',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const name = isEn ? 'CTS Business Consulting & Management' : 'CTS Consultoria Empresarial';
  const description = isEn
    ? 'Accounting, tax consulting, ERP implementation and professional training in Luanda, Angola. ANPG certified supplier.'
    : 'Contabilidade, consultoria fiscal, implementação de ERP e formação profissional em Luanda, Angola. Fornecedor homologado pela ANPG.';

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s | ${name}` },
    description,
    applicationName: name,
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: 'CTS',
      statusBarStyle: 'black-translucent',
    },
    icons: {
      icon: [
        { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'pt-PT': '/pt',
        en: '/en',
        'x-default': '/pt',
      },
    },
    openGraph: {
      type: 'website',
      siteName: name,
      locale: isEn ? 'en_US' : 'pt_PT',
      url: `/${locale}`,
      title: name,
      description,
      images: [{ url: '/og/cts-cover.png', width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description,
      images: ['/og/cts-cover.png'],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
