import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/scroll/reveal';
import { localePath } from '@/lib/site';
import { ArrowRight, Newspaper } from 'lucide-react';
import Link from 'next/link';

export function NewsView({ locale }: { locale: 'pt' | 'en' }) {
  const isPt = locale === 'pt';

  return (
    <>
      <PageHero
        eyebrow={isPt ? 'Notícias e recursos' : 'News & resources'}
        title={isPt ? 'Actualidade da CTS' : 'CTS updates'}
        lede={
          isPt
            ? 'Espaço dedicado a artigos, notícias e recursos sobre contabilidade, fiscalidade e gestão empresarial em Angola.'
            : 'A dedicated space for articles, news and resources on accounting, tax and business management in Angola.'
        }
      />

      <section className="section-y bg-surface-muted">
        <div className="shell">
          <Reveal>
            <div className="card overflow-hidden">
              <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                <div className="flex items-center justify-center bg-ink px-8 py-14">
                  <Newspaper size={64} className="text-white/20" strokeWidth={1.25} />
                </div>
                <div className="p-9 lg:p-12">
                  <p className="eyebrow">{isPt ? 'Em preparação' : 'Coming soon'}</p>
                  <h2 className="heading-md mt-5">
                    {isPt ? 'Ainda não há publicações.' : 'No posts yet.'}
                  </h2>
                  <p className="lede mt-5">
                    {isPt
                      ? 'Artigos, notícias e recursos sobre contabilidade, fiscalidade e gestão empresarial em Angola serão publicados aqui pela equipa CTS.'
                      : 'Articles, news and resources on accounting, tax and business management in Angola will be published here by the CTS team.'}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`${localePath(locale, 'contact')}#contacto`}
                      className="btn-primary"
                    >
                      {isPt ? 'Falar connosco' : 'Contact us'}
                      <ArrowRight size={17} />
                    </Link>
                    <Link href={localePath(locale, 'about')} className="btn-outline">
                      {isPt ? 'Conhecer a CTS' : 'Get to know CTS'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
