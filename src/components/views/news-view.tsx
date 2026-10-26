import { Reveal } from '@/components/reveal';
import { ButtonLink } from '@/components/ui/button-link';
import { type Locale, localePath } from '@/lib/site';

export function NewsView({ locale }: { locale: Locale }) {
  return (
    <>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
          {locale === 'pt' ? 'Notícias e Recursos' : 'News & Resources'}
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-ink">
          {locale === 'pt' ? 'Actualidade da CTS' : 'CTS Updates'}
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        {/* Estado vazio honesto — o conteúdo será publicado pela administração (Fase 6) */}
        <div className="mt-12 rounded-lg border border-dashed border-gray-300 bg-surface p-12 text-center">
          <p className="text-lg font-medium text-ink">
            {locale === 'pt' ? 'Ainda não há publicações.' : 'No posts yet.'}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            {locale === 'pt'
              ? 'Artigos, notícias e recursos sobre contabilidade, fiscalidade e gestão empresarial em Angola serão publicados aqui.'
              : 'Articles, news and resources about accounting, tax and business management in Angola will be published here.'}
          </p>
          <div className="mt-6">
            <ButtonLink href={localePath(locale, 'contact')} variant="outline">
              {locale === 'pt' ? 'Falar connosco' : 'Contact us'}
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </>
  );
}
