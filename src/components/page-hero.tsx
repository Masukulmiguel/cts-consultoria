import type { ReactNode } from 'react';

export type PageHeroProps = {
  eyebrow: string;
  title: string;
  lede?: string;
  aside?: ReactNode;
};

export function PageHero({ eyebrow, title, lede, aside }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% -10%, rgba(0,84,174,0.14), transparent 45%), radial-gradient(circle at 92% 0%, rgba(228,22,32,0.10), transparent 40%)',
        }}
      />
      <div className="shell relative grid gap-10 py-16 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:py-24">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="heading-xl mt-5 max-w-3xl">{title}</h1>
          {lede ? <p className="lede mt-6">{lede}</p> : null}
        </div>
        {aside ? <div className="lg:justify-self-end">{aside}</div> : null}
      </div>
    </section>
  );
}
