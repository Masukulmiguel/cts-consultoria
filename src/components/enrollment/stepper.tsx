import { Check } from 'lucide-react';
import Link from 'next/link';

const ETAPAS = [
  { numero: 1, label: 'Identificação' },
  { numero: 2, label: 'Documento' },
  { numero: 3, label: 'Fotografia' },
  { numero: 4, label: 'Pagamento' },
  { numero: 5, label: 'Revisão' },
] as const;

type Props = {
  /** Etapa em que o formando se encontra (1..5). */
  currentStep: number;
  /** Caminho base das etapas, sem o número: `/pt/aluno/inscricao/<id>/etapa`. */
  basePath: string;
  /** Total de etapas (5 por defeito). */
  total?: number;
};

/**
 * Stepper das 5 etapas do wizard de inscrição. As etapas concluídas são
 * ligações, a actual é marcada com `aria-current="step"` e as futuras ficam
 * desactivadas.
 */
export function Stepper({ currentStep, basePath, total = ETAPAS.length }: Props) {
  const restantes = Math.max(total - currentStep, 0);

  return (
    <nav aria-label="Etapas da inscrição" className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-accent-600">
          Etapa {currentStep} de {total}
        </p>
        <p className="text-xs text-ink-muted">Faltam {restantes}</p>
      </div>

      <ol className="mt-4 grid gap-2 sm:grid-cols-5">
        {ETAPAS.map((etapa) => {
          const actual = etapa.numero === currentStep;
          const concluida = etapa.numero < currentStep;
          const futuro = etapa.numero > currentStep;

          const numero = (
            <span
              aria-hidden="true"
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                actual
                  ? 'bg-primary-600 text-white'
                  : concluida
                    ? 'bg-success-bg text-success'
                    : 'bg-surface-subtle text-ink-muted'
              }`}
            >
              {concluida ? <Check size={14} /> : etapa.numero}
            </span>
          );

          const etiqueta = (
            <span
              className={`text-xs font-medium leading-tight ${
                actual ? 'text-ink' : concluida ? 'text-ink-secondary' : 'text-ink-muted'
              }`}
            >
              {etapa.label}
            </span>
          );

          return (
            <li
              key={etapa.numero}
              data-step={etapa.numero}
              aria-current={actual ? 'step' : undefined}
              aria-disabled={futuro ? 'true' : undefined}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                actual ? 'border-primary-200 bg-primary-50' : 'border-transparent bg-surface-muted'
              }`}
            >
              {concluida ? (
                <Link
                  href={`${basePath}/${etapa.numero}`}
                  className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                  {numero}
                  {etiqueta}
                </Link>
              ) : (
                <>
                  {numero}
                  {etiqueta}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
