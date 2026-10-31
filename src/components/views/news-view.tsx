import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/scroll/reveal';
import { TiltCard } from '@/components/scroll/tilt-card';
import { getPublicNews } from '@/lib/content-db';
import { localePath } from '@/lib/site';
import { ArrowRight, Newspaper } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export async function NewsView({ locale }: { locale: 'pt' | 'en' }) {
  const isPt = locale === 'pt';
  const posts = await getPublicNews();

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
          {posts.length === 0 ? (
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
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <Reveal key={post.id} delay={index * 0.05}>
                  <TiltCard className="h-full" max={2}>
                    <article className="card card-hover flex h-full flex-col overflow-hidden">
                      {post.imageUrl ? (
                        <div className="relative aspect-4/3 overflow-hidden bg-surface-muted">
                          <Image
                            src={post.imageUrl}
                            alt={post.title[locale]}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-1 flex-col p-7">
                        <div className="flex items-center gap-3">
                          {post.category ? (
                            <span className="inline-flex rounded-pill bg-primary-50 px-3 py-1 text-2xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                              {post.category}
                            </span>
                          ) : null}
                          <time
                            dateTime={post.publishedAt.toISOString()}
                            className="text-xs text-ink-muted"
                          >
                            {post.publishedAt.toLocaleDateString(isPt ? 'pt-PT' : 'en-GB', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </time>
                        </div>
                        <h2 className="mt-4 font-display text-lg font-semibold leading-snug text-ink">
                          {post.title[locale]}
                        </h2>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-secondary">
                          {post.excerpt[locale]}
                        </p>
                      </div>
                    </article>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
