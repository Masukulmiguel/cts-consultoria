'use client';

import type { WizardActionResult } from '@/actions/enrollment-wizard/common';
import { saveStep3 } from '@/actions/enrollment-wizard/step3';
import { FileDropzone } from '@/components/enrollment/file-dropzone';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

const ORIENTACOES = [
  'Rosto visível',
  'Boa iluminação',
  'Frontal',
  'Sem filtros',
  'Sem óculos escuros',
  'Fundo simples',
];

const JUSTIFICACAO =
  'Será usada para identificação administrativa, organização da turma, controlo de presenças e confirmação da identidade no dia da formação.';

type Props = {
  enrollmentId: string;
  documento: { nome: string; previewUrl: string | null } | null;
};

export function Step3({ enrollmentId, documento }: Props) {
  const router = useRouter();
  const [estado, submeter, pendente] = useActionState<WizardActionResult | null, FormData>(
    async (prev, formData) => saveStep3(enrollmentId, prev, formData),
    null,
  );
  const [ficheiro, setFicheiro] = useState<File | null>(null);

  useEffect(() => {
    if (estado?.ok && estado.nextStep === 4) {
      router.push(`/pt/aluno/inscricao/${enrollmentId}/etapa/4`);
    }
  }, [estado, enrollmentId, router]);

  return (
    <section className="space-y-4">
      <div className="card p-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Precisamos de uma fotografia sua.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          Fotografe-se de frente, com boa iluminação e um fundo simples. Pode ajustar o
          enquadramento antes de guardar.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-surface-muted p-4">
            <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Orientações
            </p>
            <ul className="mt-2 space-y-1 text-sm text-ink-secondary">
              {ORIENTACOES.map((orientacao) => (
                <li key={orientacao}>• {orientacao}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-primary-200 bg-primary-50 p-4">
            <p className="inline-flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em] text-primary-700">
              <Info size={13} />
              Para que serve
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{JUSTIFICACAO}</p>
            <p className="mt-2 text-xs text-ink-muted">
              Não é feita qualquer análise ou reconhecimento facial. A semelhança com o Bilhete de
              Identidade é verificada por um funcionário.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <form action={submeter} className="space-y-3">
          <FileDropzone
            name="file"
            label="Fotografia do formando"
            hint="JPEG ou PNG até 8 MB. Pode recortar a imagem antes de guardar."
            file={ficheiro}
            onFileChange={setFicheiro}
            previewUrl={documento?.previewUrl ?? null}
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

          <button
            type="submit"
            disabled={!ficheiro || pendente}
            className="btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-60"
          >
            {pendente ? 'A guardar…' : 'Guardar fotografia'}
          </button>
        </form>
      </div>
    </section>
  );
}
