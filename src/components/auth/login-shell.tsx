import Image from 'next/image';
import type { ReactNode } from 'react';

const DESKTOP_BACKGROUND = "url('/images/login-background.png')";
const MOBILE_BACKGROUND = "url('/images/login-mobile-background.png')";

export type LoginShellProps = {
  title: string;
  subtitle: string;
  help: string;
  helpLinkLabel: string;
  helpHref: string;
  brandLabel: string;
  children: ReactNode;
};

type BrandProps = {
  brandLabel: string;
  className?: string;
};

function Brand({ brandLabel, className }: BrandProps) {
  return (
    <Image
      src="/brand/cts-wordmark.png"
      alt={brandLabel}
      width={260}
      height={80}
      priority
      className={className ?? 'h-14 w-auto lg:h-16'}
    />
  );
}

export function LoginShell({
  title,
  subtitle,
  help,
  helpLinkLabel,
  helpHref,
  brandLabel,
  children,
}: LoginShellProps) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-clip bg-white supports-[height:100dvh]:min-h-dvh lg:block">
      <div
        aria-hidden="true"
        className="animate-login-image absolute inset-0 hidden bg-cover bg-left bg-no-repeat lg:block"
        style={{ backgroundImage: DESKTOP_BACKGROUND }}
      />
      <div
        aria-hidden="true"
        className="animate-login-image absolute inset-0 bg-cover bg-top bg-no-repeat md:hidden"
        style={{ backgroundImage: MOBILE_BACKGROUND }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 hidden h-[46vh] min-h-[280px] bg-cover bg-left bg-no-repeat md:block lg:hidden"
        style={{ backgroundImage: DESKTOP_BACKGROUND }}
      />

      <div className="relative z-10 flex min-h-screen flex-1 flex-col justify-end supports-[height:100dvh]:min-h-dvh lg:min-h-screen lg:justify-center lg:py-14">
        <div className="flex flex-1 items-start px-5 pt-8 md:px-10 md:pt-12 lg:hidden">
          <div className="animate-login-in rounded-2xl bg-white/95 px-4 py-3 shadow-lg shadow-primary-900/20 backdrop-blur-sm md:px-5">
            <Brand brandLabel={brandLabel} className="h-11 w-auto md:h-14" />
            <span className="mt-2.5 block h-1 w-12 rounded-full bg-accent-500" />
          </div>
        </div>

        <div className="w-full lg:mr-[8%] lg:ml-auto lg:max-w-[400px]">
          <div className="animate-login-in hidden lg:block" style={{ animationDelay: '0.18s' }}>
            <Brand brandLabel={brandLabel} className="h-16 w-auto" />
            <span className="mt-3 block h-1 w-12 rounded-full bg-accent-500" />
          </div>

          <div className="rounded-t-[24px] bg-white px-5 pt-7 pb-8 shadow-[0_-12px_36px_rgba(11,27,47,0.12)] md:mx-auto md:-mt-12 md:mb-10 md:w-[520px] md:rounded-[24px] md:px-9 md:pt-8 md:pb-10 md:shadow-[0_24px_60px_rgba(11,27,47,0.18)] lg:mx-0 lg:mt-0 lg:mb-0 lg:w-full lg:max-w-[400px] lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="mx-auto max-w-[420px] lg:max-w-none">
              <div className="animate-login-in" style={{ animationDelay: '0.3s' }}>
                <h1 className="mt-6 max-lg:mt-0 font-display text-2xl font-bold text-ink sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subtitle}</p>
              </div>

              <div className="animate-login-in mt-8" style={{ animationDelay: '0.44s' }}>
                {children}
              </div>

              <p
                className="animate-login-in mt-8 text-xs leading-relaxed text-ink-muted"
                style={{ animationDelay: '0.58s' }}
              >
                {help}{' '}
                <a
                  href={helpHref}
                  className="font-semibold text-primary-600 underline-offset-2 transition-colors hover:text-primary-700 hover:underline"
                >
                  {helpLinkLabel}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
