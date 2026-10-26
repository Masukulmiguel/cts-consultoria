import { cn } from '@/lib/site';
import Link from 'next/link';

const styles = {
  primary: 'bg-brand-blue text-white hover:bg-brand-blue-dark',
  accent: 'bg-brand-red text-white hover:bg-brand-red-dark',
  outline: 'border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-white',
  'ghost-light': 'border border-white/40 text-white hover:bg-white/10',
};

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'outline' | 'ghost-light';
  className?: string;
  external?: boolean;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded px-6 py-3 text-sm font-semibold transition-colors duration-200';

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, styles[variant], className)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(base, styles[variant], className)}>
      {children}
    </Link>
  );
}
