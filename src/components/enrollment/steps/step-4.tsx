'use client';

import type { WizardActionResult } from '@/actions/enrollment-wizard/common';
import { saveStep4 } from '@/actions/enrollment-wizard/step4';
import { FileDropzone } from '@/components/enrollment/file-dropzone';
import { valorParaInput } from '@/lib/enrollment-wizard/payment-amount';
import { parseAmountKz } from '@/lib/ocr/extract-amount';
import { runProofOcr } from '@/lib/ocr/run-client-ocr';
import { Building2, CreditCard, Loader2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

const AVISO_PAGAMENTO =
  'A leitura automática não confirma que o pagamento foi recebido. O pagamento só é confirmado por um funcionário responsável.';

const FIELD =
  'w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-ink shadow-xs transition placeholder:text-ink-muted focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100';

type Props = {
  enrollmentId: string;
  curso: { titulo: string; nivel: string | null; preco: string | null; resumo: string | null };
  pagamento: { bank: string | null; express: string | null; instructions: string | null };
  documento: { nome: string; previewUrl: string | null } | null;
  metodo: 'EXPRESS' | 'BANK_TRANSFER';
  valor: string;
  dataPagamento: string;
  referencia: string;
};

export function Step4({
  enrollmentId,
  curso,
  pagamento,
  documento,
  metodo: metodoInicial,
  valor: valorInicial,
  dataPagamento: dataInicial,
  referencia: referenciaInicial,
}: Props) {
  const router = useRouter();
  const [estado, submeter, pendente] = useActionState<WizardActionResult | null, FormData>(
    async (prev, formData) => saveStep4(enrollmentId, prev, formData),
    null,
  );
  const [ficheiro, setFicheiro] = useState<File | null>(null);
  const [metodo, setMetodo] = useState<'EXPRESS' | 'BANK_TRANSFER'>(metodoInicial);
  const [dataPagamento, setDataPagamento] = useState(dataInicial);
  const [referencia, setReferencia] = useState(referenciaInicial);
  const [ocr, setOcr] = useState<{
    amount?: string;
    paymentDate?: string;
    reference?: string;
    confidence: number;
    raw: string;
  } | null>(null);
  const [aLer, setALer] = useState(false);

  const preco = parseAmountKz(curso.preco ?? '');
  const valor = valorParaInput(valorInicial);
  const semConfiguracao = !pagamento.bank && !pagamento.express && !pagamento.instructions;

  useEffect(() => {
    if (estado?.ok && estado.nextStep === 5 && !estado.message) {
      router.push(`/pt/aluno/inscricao/${enrollmentId}/etapa/5`);
    }
  }, [estado, enrollmentId, router]);

  async function escolherFicheiro(file: File | null) {
    setFicheiro(file);
    setOcr(null);
    if (!file) return;

    setALer(true);
    const resultado = await runProofOcr(file);
    setOcr(resultado);
    setALer(false);
  }

  return (
    <section className="space-y-4">
      <div className="card p-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Confirme o pagamento da sua formação.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          Os dados do curso e as instruções de pagamento são lidos da base de dados da CTS.
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-surface-muted p-4">
            <dt className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Formação
            </dt>
            <dd className="mt-1 text-sm font-semibold text-ink">{curso.titulo}</dd>
            {curso.nivel ? (
              <dd className="text-xs text-ink-secondary">Nível: {curso.nivel}</dd>
            ) : null}
            {curso.resumo ? (
              <dd className="mt-1 text-xs leading-relaxed text-ink-secondary">{curso.resumo}</dd>
            ) : null}
          </div>

          <div className="rounded-md border border-border bg-surface-muted p-4">
            <dt className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Valor da formação
            </dt>
            <dd className="mt-1 text-sm font-semibold text-ink">
              {preco !== null ? `${preco.toLocaleString('pt-PT')} Kz` : 'Preço por definir'}
            </dd>
            <dd className="mt-1 text-xs text-ink-secondary">
              O valor oficial é o que está registado no curso.
            </dd>
          </div>
        </dl>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Como quer pagar?</h2>

        {semConfiguracao ? (
          <p className="mt-3 rounded-md border border-warning/30 bg-warning-bg px-3 py-2.5 text-sm text-warning">
            Dados de pagamento em configuração: contacte a secretaria para obter as instruções.
          </p>
        ) : null}

        <form action={submeter} className="mt-4 space-y-4">
          <input type="hidden" name="ocrValue" value={ocr?.amount ?? ''} />
          <input type="hidden" name="ocrReference" value={ocr?.reference ?? ''} />
          <input type="hidden" name="ocrDate" value={ocr?.paymentDate ?? ''} />
          <input type="hidden" name="ocrRaw" value={ocr?.raw ?? ''} />
          <input type="hidden" name="ocrConfidence" value={ocr?.confidence ?? ''} />

          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                metodo === 'EXPRESS'
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-border bg-white hover:border-primary-200'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <CreditCard size={16} />A — Express
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-secondary">
                {pagamento.express ?? 'Pagamento por Multicaixa Express.'}
              </span>
              <input
                type="radio"
                name="method"
                value="EXPRESS"
                checked={metodo === 'EXPRESS'}
                onChange={() => setMetodo('EXPRESS')}
                className="mt-3"
              />
            </label>

            <label
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                metodo === 'BANK_TRANSFER'
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-border bg-white hover:border-primary-200'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Building2 size={16} />B — Transferência bancária
              </span>
              <span className="mt-1 block whitespace-pre-line text-xs leading-relaxed text-ink-secondary">
                {pagamento.bank ?? 'Transferência para a conta da CTS.'}
              </span>
              <input
                type="radio"
                name="method"
                value="BANK_TRANSFER"
                checked={metodo === 'BANK_TRANSFER'}
                onChange={() => setMetodo('BANK_TRANSFER')}
                className="mt-3"
              />
            </label>
          </div>

          {pagamento.instructions ? (
            <p className="rounded-md border border-border bg-surface-muted px-3 py-2.5 text-sm leading-relaxed text-ink-secondary">
              {pagamento.instructions}
            </p>
          ) : null}

          <p className="flex items-start gap-2 rounded-md border border-info/30 bg-info-bg px-3 py-2.5 text-sm text-info">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <span>{AVISO_PAGAMENTO}</span>
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium text-ink">
              Valor pago (Kz)
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                readOnly
                value={valor}
                className={`${FIELD} mt-1.5 bg-surface-muted`}
              />
            </label>

            <label className="block text-sm font-medium text-ink">
              Data do pagamento
              <input
                name="paymentDate"
                type="date"
                required
                value={dataPagamento}
                onChange={(event) => setDataPagamento(event.target.value)}
                className={`${FIELD} mt-1.5`}
              />
            </label>

            <label className="block text-sm font-medium text-ink">
              Referência
              <input
                name="reference"
                value={referencia}
                onChange={(event) => setReferencia(event.target.value)}
                placeholder="Referência da transferência"
                className={`${FIELD} mt-1.5`}
              />
            </label>
          </div>

          <FileDropzone
            name="file"
            label="Comprovativo de pagamento"
            hint="Fotografe o comprovativo ou carregue o PDF. JPEG, PNG ou PDF até 8 MB."
            file={ficheiro}
            onFileChange={(file) => void escolherFicheiro(file)}
            previewUrl={documento?.previewUrl ?? null}
            busy={aLer}
            error={estado?.errors?.file}
          />

          {estado?.errors && !estado.errors.file ? (
            <div className="space-y-1 rounded-md border border-error/30 bg-error-bg px-3 py-2.5">
              {Object.entries(estado.errors).map(([campo, mensagem]) => (
                <p key={campo} role="alert" className="text-sm text-error">
                  {mensagem}
                </p>
              ))}
            </div>
          ) : null}

          {estado?.message ? (
            <p
              role="alert"
              className={`rounded-md px-3 py-2.5 text-sm ${
                estado.ok
                  ? 'border border-warning/30 bg-warning-bg text-warning'
                  : 'border border-error/30 bg-error-bg text-error'
              }`}
            >
              {estado.message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pendente || aLer || semConfiguracao || preco === null}
              className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {pendente ? (
                <>
                  <Loader2 size={15} className="animate-spin" />A registar…
                </>
              ) : (
                'Registar pagamento'
              )}
            </button>

            {estado?.ok && estado.message ? (
              <button
                type="button"
                onClick={() => router.push(`/pt/aluno/inscricao/${enrollmentId}/etapa/5`)}
                className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:border-primary-300 hover:text-primary-600"
              >
                Continuar para a revisão
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
