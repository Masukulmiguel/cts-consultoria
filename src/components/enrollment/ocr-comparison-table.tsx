import type { ComparedField, FieldOutcome } from '@/lib/ocr/compare';

const ROTULOS: Record<string, string> = {
  fullName: 'Nome',
  biNumber: 'Número do BI',
  birthDate: 'Data de nascimento',
};

const RESULTADOS: Record<FieldOutcome, { label: string; className: string }> = {
  MATCH: { label: 'Correspondência', className: 'bg-success-bg text-success' },
  DIFFERENT: { label: 'Divergência', className: 'bg-warning-bg text-warning' },
  UNKNOWN: { label: 'Não foi possível identificar', className: 'bg-surface-subtle text-ink-muted' },
};

/**
 * Tabela de comparação entre os dados da inscrição e os dados extraídos pelo
 * OCR. A leitura automática nunca aprova nada: só propõe.
 */
export function OcrComparisonTable({ comparison }: { comparison: ComparedField[] }) {
  if (comparison.length === 0) {
    return (
      <p className="rounded-md border border-border bg-surface-muted px-3 py-2.5 text-sm text-ink-secondary">
        Ainda não há leitura do documento para comparar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-surface-muted text-2xs uppercase tracking-[0.12em] text-ink-muted">
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Campo
            </th>
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Dados da inscrição
            </th>
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Dados extraídos
            </th>
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Resultado
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {comparison.map((campo) => {
            const resultado = RESULTADOS[campo.outcome];
            return (
              <tr key={campo.field} data-field={campo.field}>
                <th scope="row" className="px-3 py-2.5 font-medium text-ink">
                  {ROTULOS[campo.field] ?? campo.field}
                </th>
                <td className="px-3 py-2.5 text-ink-secondary">{campo.registered || '—'}</td>
                <td className="px-3 py-2.5 text-ink-secondary">
                  {campo.extracted ?? '—'}
                  <span className="mt-0.5 block text-2xs uppercase tracking-[0.1em] text-ink-muted">
                    dados sujeitos a validação documental
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-flex rounded-pill px-2.5 py-1 text-xs font-semibold ${resultado.className}`}
                  >
                    {resultado.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
