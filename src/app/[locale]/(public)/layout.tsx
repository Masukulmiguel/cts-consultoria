import { ChatbotWidget } from '@/components/chatbot/chatbot-widget';
import { ScrollProgress } from '@/components/scroll/scroll-progress';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Locale } from '@/i18n/routing';

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = (locale === 'en' ? 'en' : 'pt') as Locale;

  const localeText =
    safeLocale === 'en'
      ? { skip: 'Skip to content', main: 'Main content' }
      : { skip: 'Saltar para o conteúdo', main: 'Conteúdo principal' };

  return (
    <div id="topo" className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {localeText.skip}
      </a>
      <ScrollProgress />
      <SiteHeader />
      <main id="conteudo" aria-label={localeText.main} className="flex-1 pt-[116px]">
        {children}
      </main>
      <SiteFooter locale={safeLocale} />
      <ChatbotWidget locale={safeLocale} />
    </div>
  );
}
