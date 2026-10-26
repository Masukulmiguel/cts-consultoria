import { Reveal } from '@/components/reveal';
import { ButtonLink } from '@/components/ui/button-link';
import { company, trainingFamilies } from '@/content/services';
import { type Locale, localePath } from '@/lib/site';

export function TrainingView({ locale }: { locale: Locale }) {
  return (
    <>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
          CTS Academia
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-ink">
          {locale === 'pt' ? 'Formação Profissional' : 'Professional Training'}
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600">
          {locale === 'pt'
            ? 'A CTS Academia de Gestão e Finanças Empresariais oferece formação prática em contabilidade, fiscalidade e software de gestão, com certificados homologados pelo INEFOP e estágios profissionais.'
            : 'The CTS Academy of Business and Finance Management offers practical training in accounting, tax and management software, with INEFOP-homologated certificates and professional internships.'}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {trainingFamilies.map((f, i) => (
          <Reveal key={f.title.pt} delay={i * 0.06}>
            <div className="h-full rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-ink">{f.title[locale]}</h2>
              <p className="mt-3 text-sm text-gray-600">{f.description[locale]}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <div className="mt-12 rounded-lg border border-brand-blue/20 bg-brand-blue-light p-8">
          <h2 className="text-lg font-semibold text-ink">
            {locale === 'pt' ? 'Próximas edições' : 'Upcoming editions'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {locale === 'pt'
              ? 'Datas, horários, vagas e investimentos das próximas formações serão publicados aqui assim que confirmados. Contacte-nos para receber aviso de abertura de inscrições.'
              : 'Dates, schedules, seats and fees for the next training sessions will be published here as soon as they are confirmed. Contact us to be notified when enrolments open.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <ButtonLink href={localePath(locale, 'contact')} variant="primary">
              {locale === 'pt' ? 'Ser avisado das inscrições' : 'Notify me about enrolments'}
            </ButtonLink>
            <ButtonLink href={company.whatsappHref} variant="outline" external>
              {locale === 'pt' ? 'WhatsApp' : 'WhatsApp'}
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </>
  );
}
