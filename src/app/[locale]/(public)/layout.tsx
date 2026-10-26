import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export default async function PublicLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = locale as 'pt' | 'en';

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pt-20">{children}</main>
      <SiteFooter locale={safeLocale} />
    </div>
  );
}