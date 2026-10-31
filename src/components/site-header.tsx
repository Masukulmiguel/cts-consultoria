'use client';

import { switchLocalePath } from '@/content/locale-paths';
import { services, trainingFamilies } from '@/content/services';
import { localePath } from '@/lib/site';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const TICKER: Record<'pt' | 'en', string[]> = {
  pt: [
    'Certificação ANPG — fornecedor homologado',
    '11 a 50 especialistas em contabilidade e fiscalidade',
    'Formação com certificados homologados pelo INEFOP',
    'Desde 2016 em Luanda, Angola',
  ],
  en: [
    'ANPG certification — certified supplier',
    '11 to 50 accounting and tax specialists',
    'Training with INEFOP-homologated certificates',
    'Since 2016 in Luanda, Angola',
  ],
};

const COPY = {
  pt: {
    menu: 'Menu',
    open: 'Abrir menu',
    close: 'Fechar menu',
    services: 'Serviços',
    training: 'Formação',
    about: 'Sobre Nós',
    news: 'Notícias',
    contact: 'Contactos',
    cta: 'Fale Connosco',
    navLabel: 'Navegação principal',
    mobileLabel: 'Navegação móvel',
    language: 'Mudar idioma',
    viewAll: 'Ver todos',
  },
  en: {
    menu: 'Menu',
    open: 'Open menu',
    close: 'Close menu',
    services: 'Services',
    training: 'Training',
    about: 'About Us',
    news: 'News',
    contact: 'Contact',
    cta: 'Contact Us',
    navLabel: 'Main navigation',
    mobileLabel: 'Mobile navigation',
    language: 'Change language',
    viewAll: 'View all',
  },
};

const OTHER_LABEL = { pt: 'EN', en: 'PT' } as const;

export function SiteHeader() {
  const locale = (usePathname().split('/')[1] === 'en' ? 'en' : 'pt') as 'pt' | 'en';
  const pathname = usePathname();
  const router = useRouter();
  const copy = COPY[locale];
  const reduce = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mega, setMega] = useState<'services' | 'training' | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);

  const drawerRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (reduce) return;
    if (tickerPaused) return;
    const timer = window.setInterval(
      () => setTickerIndex((index) => (index + 1) % TICKER[locale].length),
      4200,
    );
    return () => window.clearInterval(timer);
  }, [locale, tickerPaused, reduce]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    window.setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
    }, 60);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!pathname) return;
    setDrawerOpen(false);
    setMega(null);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const serviceHref = localePath(locale, 'services');
  const trainingHref = localePath(locale, 'training');

  const navItems = [
    { key: 'about', label: copy.about, href: localePath(locale, 'about') },
    { key: 'services', label: copy.services, href: serviceHref, mega: true },
    { key: 'training', label: copy.training, href: trainingHref, mega: true },
    { key: 'news', label: copy.news, href: localePath(locale, 'news') },
    { key: 'contact', label: copy.contact, href: localePath(locale, 'contact') },
  ];

  const megaPanel = () => {
    if (mega === 'services') {
      return (
        <div className="grid gap-x-8 gap-y-3 p-6 md:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.slug[locale]}
              href={`${serviceHref}/${service.slug[locale]}`}
              className="group flex gap-3 rounded-md p-3 transition-colors hover:bg-primary-50"
            >
              <span className="flex-1">
                <span className="block text-sm font-semibold text-ink group-hover:text-primary-700">
                  {service.title[locale]}
                </span>
                <span className="mt-0.5 block text-xs text-ink-muted">
                  {service.category[locale]}
                </span>
              </span>
            </Link>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-3 p-6 md:grid-cols-3">
        {trainingFamilies.map((family) => (
          <Link
            key={family.title.en}
            href={trainingHref}
            className="group rounded-md p-3 transition-colors hover:bg-primary-50"
          >
            <span className="block text-sm font-semibold text-ink group-hover:text-primary-700">
              {family.title[locale]}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
              {family.description[locale].slice(0, 110)}…
            </span>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className="overflow-hidden bg-ink text-white"
        onMouseEnter={() => setTickerPaused(true)}
        onMouseLeave={() => setTickerPaused(false)}
        onFocus={() => setTickerPaused(true)}
        onBlur={() => setTickerPaused(false)}
      >
        <div className="shell flex h-9 items-center justify-between gap-4">
          <div className="relative h-9 min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`${locale}-${tickerIndex}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center gap-2 text-[11px] font-medium tracking-wide text-white/80 sm:text-xs"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                <span className="truncate">{TICKER[locale][tickerIndex]}</span>
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            {TICKER[locale].map((message, index) => (
              <button
                key={message}
                type="button"
                onClick={() => setTickerIndex(index)}
                aria-label={message}
                aria-current={index === tickerIndex}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === tickerIndex
                    ? 'w-5 bg-accent-500'
                    : 'w-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className={`border-b border-border bg-surface/95 backdrop-blur-md transition-all duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-none'
        }`}
      >
        <div className="shell flex items-center justify-between gap-6">
          <Link
            href={localePath(locale, 'home')}
            className="flex shrink-0 items-center"
            aria-label="CTS Consultoria Empresarial & Gestão de Negócios"
          >
            <Image
              src="/brand/cts-wordmark.png"
              alt="CTS — Consultoria Empresarial & Gestão de Negócios"
              width={508}
              height={155}
              priority
              className={`hidden w-auto transition-all duration-300 sm:block ${
                scrolled ? 'h-10' : 'h-12'
              }`}
            />
            <Image
              src="/brand/cts-mark.png"
              alt="CTS"
              width={300}
              height={287}
              priority
              className={`w-auto transition-all duration-300 sm:hidden ${
                scrolled ? 'h-9' : 'h-11'
              }`}
            />
          </Link>

          <nav
            aria-label={copy.navLabel}
            className="hidden items-center gap-1 lg:flex"
            onMouseLeave={() => setMega(null)}
          >
            {navItems.map((item) => (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() =>
                  setMega(item.mega ? (item.key as 'services' | 'training') : null)
                }
              >
                {item.mega ? (
                  <button
                    type="button"
                    aria-expanded={mega === item.key}
                    aria-haspopup="true"
                    onClick={() =>
                      setMega(mega === item.key ? null : (item.key as 'services' | 'training'))
                    }
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-700'
                        : 'text-ink-secondary hover:text-primary-700'
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-200 ${
                        mega === item.key ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-700'
                        : 'text-ink-secondary hover:text-primary-700'
                    }`}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent-500" />
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(switchLocalePath(locale, pathname))}
              aria-label={copy.language}
              className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-border px-3 text-xs font-semibold text-ink-secondary transition-colors hover:border-primary-300 hover:text-primary-700"
            >
              <Globe size={14} />
              {OTHER_LABEL[locale]}
            </button>

            <Link
              href={`${localePath(locale, 'contact')}#contacto`}
              className="btn-primary hidden h-10 px-4 lg:inline-flex"
            >
              {copy.cta}
            </Link>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setDrawerOpen((open) => !open)}
              aria-expanded={drawerOpen}
              aria-controls="menu-movel"
              aria-label={drawerOpen ? copy.close : copy.open}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink lg:hidden"
            >
              {drawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full hidden border-b border-border bg-surface shadow-lg lg:block"
              onMouseEnter={() => setMega(mega)}
            >
              <div className="shell">{megaPanel()}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              type="button"
              tabIndex={-1}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-[var(--overlay)] lg:hidden"
            />
            <motion.dialog
              open
              id="menu-movel"
              ref={drawerRef}
              aria-modal="true"
              aria-label={copy.mobileLabel}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed left-auto right-0 top-0 z-50 m-0 flex h-full max-h-none w-[86%] max-w-sm flex-col overflow-y-auto border-0 bg-surface p-0 text-inherit shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Image
                  src="/brand/cts-mark.png"
                  alt="CTS"
                  width={300}
                  height={287}
                  className="h-9 w-auto"
                />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label={copy.close}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink"
                >
                  <X size={20} />
                </button>
              </div>

              <nav aria-label={copy.mobileLabel} className="flex-1 px-5 py-6">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center justify-between rounded-md px-3 py-3 text-base font-semibold ${
                          isActive(item.href)
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-ink-secondary'
                        }`}
                      >
                        {item.label}
                        <ChevronDown size={16} className="-rotate-90 opacity-40" />
                      </Link>
                    </li>
                  ))}
                </ul>

                {mega === 'services' && (
                  <ul className="mt-3 space-y-1 border-l border-border pl-3">
                    {services.map((service) => (
                      <li key={service.slug[locale]}>
                        <Link
                          href={`${serviceHref}/${service.slug[locale]}`}
                          onClick={() => setDrawerOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm text-ink-secondary"
                        >
                          {service.title[locale]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </nav>

              <div className="border-t border-border px-5 py-5">
                <Link
                  href={`${localePath(locale, 'contact')}#contacto`}
                  onClick={() => setDrawerOpen(false)}
                  className="btn-primary w-full"
                >
                  {copy.cta}
                </Link>
              </div>
            </motion.dialog>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
