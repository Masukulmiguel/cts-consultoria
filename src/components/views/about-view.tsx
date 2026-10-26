import { Reveal } from '@/components/reveal';
import { about, company, facts, mission } from '@/content/services';
import type { Locale } from '@/i18n/routing';

export function AboutView({ locale }: { locale: Locale }) {
  return (
    <>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
          {locale === 'pt' ? 'Institucional' : 'Corporate'}
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-ink">{about.title[locale]}</h1>
      </Reveal>
      <div className="mt-12 grid gap-12 md:grid-cols-[1.3fr_1fr]">
        <Reveal>
          <div className="space-y-4 text-lg text-gray-600">
            {about.paragraphs.map((p) => (
              <p key={p.pt}>{p[locale]}</p>
            ))}
          </div>
          <blockquote className="mt-8 border-l-2 border-brand-red bg-surface p-6 italic text-ink">
            “{mission[locale]}”
          </blockquote>
          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-gray-200 pt-8">
            {facts.map((f) => (
              <div key={f.label.pt}>
                <dt className="text-xs uppercase tracking-widest text-gray-400">
                  {f.label[locale]}
                </dt>
                <dd className="mt-1 font-semibold text-ink">{f.value[locale]}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.15}>
          <figure className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <img
              src={company.ceo.photo}
              alt={company.ceo.name}
              className="aspect-[4/5] w-full object-cover object-top"
              loading="lazy"
            />
            <figcaption className="p-5">
              <p className="text-xs uppercase tracking-widest text-brand-red">
                {locale === 'pt'
                  ? 'Direção & Liderança Executiva'
                  : 'Direction & Executive Leadership'}
              </p>
              <p className="mt-2 text-lg font-semibold text-ink">{company.ceo.name}</p>
              <p className="mt-1 text-sm text-gray-500">{company.ceo.role[locale]}</p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </>
  );
}
