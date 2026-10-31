'use client';

import { Download, Share, Smartphone, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const STORAGE_KEY = 'cts-install-dismissed';
const STORAGE_INSTALLED = 'cts-install-completed';
const DISMISS_DAYS = 30;

const COPY = {
  pt: {
    title: 'Instale a app CTS',
    text: 'Aceda aos nossos serviços, formação e documentos do formando direto do seu ecrã inicial.',
    install: 'Instalar app',
    later: 'Agora não',
    close: 'Fechar aviso de instalação',
    iosTitle: 'Adicione ao ecrã inicial',
    iosText:
      'Toque no botão Partilhar e escolha "Adicionar ao ecrã principal" para ter a CTS sempre à mão.',
  },
  en: {
    title: 'Install the CTS app',
    text: 'Reach our services, training and student documents straight from your home screen.',
    install: 'Install app',
    later: 'Not now',
    close: 'Close install prompt',
    iosTitle: 'Add to home screen',
    iosText: 'Tap the Share button and choose "Add to Home Screen" to keep CTS always at hand.',
  },
} as const;

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) && !window.navigator.userAgent.includes('MSStream');
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 767px)').matches;
}

export function InstallPrompt({ locale }: { locale: 'pt' | 'en' }) {
  const copy = COPY[locale];
  const reduce = useReducedMotion();
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const age = Date.now() - Number(dismissed);
      if (Number.isFinite(age) && age < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    if (window.localStorage.getItem(STORAGE_INSTALLED)) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
      if (isMobileViewport()) setVisible(true);
    };

    const onInstalled = () => {
      window.localStorage.setItem(STORAGE_INSTALLED, String(Date.now()));
      setInstallEvent(null);
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    if (isIos() && isMobileViewport()) {
      setIos(true);
      setVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }, []);

  const install = useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') {
      window.localStorage.setItem(STORAGE_INSTALLED, String(Date.now()));
    } else {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }
    setInstallEvent(null);
    setVisible(false);
  }, [installEvent]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.aside
          initial={reduce ? false : { y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 120, opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-[90] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[22rem]"
          aria-label={copy.title}
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_60px_-24px_rgba(11,27,47,0.55)]">
            <div className="flex items-start gap-3 p-4 pb-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white">
                {ios ? <Share size={20} /> : <Smartphone size={20} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-ink">
                  {ios ? copy.iosTitle : copy.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {ios ? copy.iosText : copy.text}
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label={copy.close}
                className="rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
            {!ios ? (
              <div className="flex items-center gap-2 border-t border-border bg-surface-muted px-4 py-3">
                <button
                  type="button"
                  onClick={install}
                  disabled={!installEvent}
                  className="btn btn-primary flex-1 justify-center text-sm"
                >
                  <Download size={15} />
                  {copy.install}
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="btn btn-ghost flex-1 justify-center text-sm"
                >
                  {copy.later}
                </button>
              </div>
            ) : null}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
