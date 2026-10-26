import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations('home');
  const tNav = useTranslations('nav');

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-blue to-[#003a80] text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold tracking-widest">CTS</span>
        <LanguageSwitcher />
      </header>
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-32">
        <p className="text-sm uppercase tracking-[0.3em] text-white/70">{t('heroKicker')}</p>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
          {t('heroTitle')}
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-white/85">{t('heroText')}</p>
        <div className="mt-12 inline-block rounded-full border border-white/30 px-6 py-2 text-sm text-white/80">
          {t('status')}
        </div>
        <nav className="mt-16 flex flex-wrap gap-6 text-sm text-white/70">
          <span>{tNav('about')}</span>
          <span>{tNav('services')}</span>
          <span>{tNav('training')}</span>
          <span>{tNav('news')}</span>
          <span>{tNav('contact')}</span>
        </nav>
      </section>
    </main>
  );
}
