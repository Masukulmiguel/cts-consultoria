import { Reveal } from '@/components/reveal';
import { services } from '@/content/services';
import { type Locale, sectionPath } from '@/lib/site';
import Link from 'next/link';

export function ServicesView({ locale }: { locale: Locale }) {
  return (
    <>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
          {locale === 'pt' ? 'Soluções Empresariais' : 'Business Solutions'}
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-ink">
          {locale === 'pt'
            ? 'Serviços Especializados de Consultoria'
            : 'Specialized Consulting Services'}
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600">
          {locale === 'pt'
            ? 'Apoiamos empresas em Angola a elevar o padrão de governança, mitigar riscos fiscais perante a AGT e otimizar a tomada de decisão financeira.'
            : 'We support companies in Angola to raise governance standards, mitigate tax risks before the AGT and optimize financial decision-making.'}
        </p>
      </Reveal>
      <div className="mt-14 space-y-6">
        {services.map((s, i) => (
          <Reveal key={s.number} delay={i * 0.04}>
            <Link
              href={`${sectionPath(locale, 'services')}/${s.slug[locale]}`}
              className="group grid gap-6 rounded-lg border border-gray-200 bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-lg md:grid-cols-[80px_1fr_auto] md:items-center"
            >
              <span className="text-sm font-semibold tracking-widest text-brand-red">
                {s.number}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-ink">{s.title[locale]}</h2>
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-gray-500">
                    {s.category[locale]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{s.summary[locale]}</p>
              </div>
              <span className="hidden text-brand-blue md:block">→</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
