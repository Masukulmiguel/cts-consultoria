'use client';

import type { WizardActionResult } from '@/actions/enrollment-wizard/common';
import { saveStep2 } from '@/actions/enrollment-wizard/step2';
import { FileDropzone } from '@/components/enrollment/file-dropzone';
import { OcrComparisonTable } from '@/components/enrollment/ocr-comparison-table';
import { runIdentityOcr } from '@/lib/ocr/run-client-ocr';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

const AVISO_OCR =
  'A leitura automática é uma proposta de preenchimento. Não confirma a autenticidade do documento. A validação é feita por um funcionário autorizado.';

type Props = {
  enrollmentId: string;
  documentoFrente: { nome: string; previewUrl: string | null } | null;
  documentoVerso: { nome: string; previewUrl: string | null } | null;
};

type OcrResultado = {
  fullName?: string;
  biNumber?: string;
  birthDate?: string;
  confidence: number;
  raw: string;
};

export function Step2({ enrollmentId, documentoFrente, documentoVerso }: Props) {
  const router = useRouter();
  const [estadoFrente, submeterFrente, pendenteFrente] = useActionState<
    WizardActionResult | null,
    FormData
  >(async (prev, formData) => saveStep2(enrollmentId, prev, formData), null);
  const [estadoVerso, submeterVerso, pendenteVerso] = useActionState<
    WizardActionResult | null,
    FormData
  >(async (prev, formData) => saveStep2(enrollmentId, prev, formData), null);

  const [ficheiroFrente, setFicheiroFrente] = useState<File | null>(null);
  const [ficheiroVerso, setFicheiroVerso] = useState<File | null>(null);
  const [ocr, setOcr] = useState<OcrResultado | null>(null);
  const [aLer, setALer] = useState(false);

  useEffect(() => {
    if (estadoFrente?.ok && estadoFrente.nextStep === 3) {
      router.push(`/pt/aluno/inscricao/${enrollmentId}/etapa/3`);
    }
  }, [estadoFrente, enrollmentId, router]);

  useEffect(() => {
    if (estadoVerso?.ok && estadoVerso.nextStep === 3) {
      router.push(`/pt/aluno/inscricao/${enrollmentId}/etapa/3`);
    }
  }, [estadoVerso, enrollmentId, router]);

  async function escolher(file: File | null, frente: boolean) {
    if (frente) {
      setFicheiroFrente(file);
    } else {
      setFicheiroVerso(file);
    }
    if (!file) {
      if (frente) setOcr(null);
      return;
    }

    setALer(true);
    const resultado = await runIdentityOcr(file);
    if (frente) setOcr(resultado);
    setALer(false);
  }

  const comparacao = estadoFrente?.comparison ?? null;
  const divergencia = comparacao?.some((campo) => campo.outcome === 'DIFFERENT') ?? false;

  return (
    <section className="space-y-4">
      <div className="card p-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Carregue o seu Bilhete de Identidade.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          São precisas duas imagens: a frente e o verso. Pode fotografar com a câmara ou escolher um
          ficheiro da galeria.
        </p>

        <p className="mt-4 flex items-start gap-2 rounded-md border border-info/30 bg-info-bg px-3 py-2.5 text-sm text-info">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <span>{AVISO_OCR}</span>
        </p>
      </div>

      <div className="card p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <form action={submeterFrente} className="space-y-3">
            <input type="hidden" name="kind" value="BI_FRONT" />
            <input type="hidden" name="ocrFullName" value={ocr?.fullName ?? ''} />
            <input type="hidden" name="ocrBiNumber" value={ocr?.biNumber ?? ''} />
            <input type="hidden" name="ocrBirthDate" value={ocr?.birthDate ?? ''} />
            <input type="hidden" name="ocrRaw" value={ocr?.raw ?? ''} />
            <input type="hidden" name="ocrConfidence" value={ocr?.confidence ?? ''} />

            <FileDropzone
              name="file"
              label="Frente do Bilhete de Identidade"
              hint="A imagem deve mostrar o rosto e o número do documento, com boa iluminação e sem reflexos."
              file={ficheiroFrente}
              onFileChange={(file) => void escolher(file, true)}
              previewUrl={documentoFrente?.previewUrl ?? null}
              busy={aLer}
              error={estadoFrente?.errors?.file}
            />

            {estadoFrente?.errors && !estadoFrente.errors.file ? (
              <div className="space-y-1 rounded-md border border-error/30 bg-error-bg px-3 py-2.5">
                {Object.entries(estadoFrente.errors).map(([campo, mensagem]) => (
                  <p key={campo} role="alert" className="text-sm text-error">
                    {mensagem}
                  </p>
                ))}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!ficheiroFrente || aLer || pendenteFrente}
              className="btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {aLer ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" />A ler o documento…
                </span>
              ) : (
                'Guardar a frente'
              )}
            </button>
          </form>

          <form action={submeterVerso} className="space-y-3">
            <input type="hidden" name="kind" value="BI_BACK" />
            <input type="hidden" name="ocrRaw" value="" />
            <input type="hidden" name="ocrConfidence" value="" />

            <FileDropzone
              name="file"
              label="Verso do Bilhete de Identidade"
              hint="A imagem deve mostrar o verso do documento, com boa iluminação e sem reflexos."
              file={ficheiroVerso}
              onFileChange={(file) => void escolher(file, false)}
              previewUrl={documentoVerso?.previewUrl ?? null}
              busy={aLer}
              error={estadoVerso?.errors?.file}
            />

            {estadoVerso?.errors && !estadoVerso.errors.file ? (
              <div className="space-y-1 rounded-md border border-error/30 bg-error-bg px-3 py-2.5">
                {Object.entries(estadoVerso.errors).map(([campo, mensagem]) => (
                  <p key={campo} role="alert" className="text-sm text-error">
                    {mensagem}
                  </p>
                ))}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!ficheiroVerso || aLer || pendenteVerso}
              className="btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {aLer ? 'A ler o documento…' : 'Guardar o verso'}
            </button>
          </form>
        </div>
      </div>

      {comparacao ? (
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Comparação dos dados do documento
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Compare os dados lidos com os dados que constam da sua inscrição.
          </p>

          <div className="mt-4">
            <OcrComparisonTable comparison={comparacao} />
          </div>

          {divergencia ? (
            <div className="mt-4 rounded-md border border-warning/30 bg-warning-bg px-3 py-2.5">
              <p className="text-sm font-semibold text-warning">Há divergências nos dados lidos.</p>
              <p className="mt-1 text-sm text-ink-secondary">
                Pode corrigir os dados da inscrição ou voltar a enviar o documento. A secretaria
                valida o documento antes de aceitar qualquer alteração.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/pt/aluno/inscricao/${enrollmentId}/etapa/1`}
                  className="rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-ink-secondary transition-colors hover:border-primary-300 hover:text-primary-600"
                >
                  Corrigir os dados da inscrição
                </Link>
                <span className="rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-ink-muted">
                  Ou use “Substituir” na área da frente para enviar outra imagem.
                </span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
