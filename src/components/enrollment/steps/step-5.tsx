'use client';

import type { WizardActionResult } from '@/actions/enrollment-wizard/common';
import { submitEnrollment } from '@/actions/enrollment-wizard/step5';
import { CheckCircle2, CircleDashed, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

type Props = {
  enrollmentId: string;
  pessoais: {
    nome: string;
    documento: string;
    dataNascimento: string;
    morada: string;
    municipio: string;
    provincia: string;
    telefone: string;
    email: string;
  };
  documentos: {
    frente: boolean;
    verso: boolean;
    fotografia: boolean;
    comprovativo: boolean;
  };
  curso: { titulo: string; nivel: string | null; preco: string | null };
  pagamento: { metodo: string; valor: string; referencia: string | null; data: string | null };
};

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-[0.1em] text-ink-muted">{rotulo}</dt>
      <dd className="text-right text-sm text-ink">{valor || '—'}</dd>
    </div>
  );
}

function Estado({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      {ok ? (
        <CheckCircle2 size={15} className="text-success" />
      ) : (
        <CircleDashed size={15} className="text-warning" />
      )}
      <span className={ok ? 'text-ink' : 'text-warning'}>{texto}</span>
    </span>
  );
}

export function Step5({ enrollmentId, pessoais, documentos, curso, pagamento }: Props) {
  const router = useRouter();
  const [estado, submeter, pendente] = useActionState<WizardActionResult | null, FormData>(
    async (prev, formData) => submitEnrollment(enrollmentId, prev, formData),
    null,
  );
  const [aceitou, setAceitou] = useState(false);

  useEffect(() => {
    if (estado?.ok) {
      router.push('/pt/aluno');
    }
  }, [estado, router]);

  return (
    <section className="card p-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Revise a sua inscrição.</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
        Confirme os dados abaixo. Depois de submeter, a secretaria valida a inscrição e pode pedir
        correcções.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Dados pessoais
          </h2>
          <dl className="mt-2">
            <Linha rotulo="Nome" valor={pessoais.nome} />
            <Linha rotulo="Documento" valor={pessoais.documento} />
            <Linha rotulo="Data de nascimento" valor={pessoais.dataNascimento} />
            <Linha rotulo="Morada" valor={pessoais.morada} />
            <Linha rotulo="Município" valor={pessoais.municipio} />
            <Linha rotulo="Província" valor={pessoais.provincia} />
            <Linha rotulo="Telefone" valor={pessoais.telefone} />
            <Linha rotulo="E-mail" valor={pessoais.email} />
          </dl>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Documentos
            </h2>
            <ul className="mt-2 space-y-1.5">
              <li>
                <Estado ok={documentos.frente} texto="Frente do Bilhete de Identidade" />
              </li>
              <li>
                <Estado ok={documentos.verso} texto="Verso do Bilhete de Identidade" />
              </li>
              <li>
                <Estado ok={documentos.fotografia} texto="Fotografia do formando" />
              </li>
              <li>
                <Estado ok={documentos.comprovativo} texto="Comprovativo de pagamento" />
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Formação e pagamento
            </h2>
            <dl className="mt-2">
              <Linha rotulo="Curso" valor={curso.titulo} />
              <Linha rotulo="Nível" valor={curso.nivel ?? ''} />
              <Linha rotulo="Valor" valor={curso.preco ? `${curso.preco} Kz` : ''} />
              <Linha rotulo="Método" valor={pagamento.metodo} />
              <Linha rotulo="Valor pago" valor={pagamento.valor} />
              <Linha rotulo="Referência" valor={pagamento.referencia ?? ''} />
              <Linha rotulo="Data do pagamento" valor={pagamento.data ?? ''} />
            </dl>
          </div>
        </div>
      </div>

      <form action={submeter} className="mt-6 space-y-4">
        <label className="flex items-start gap-2.5 text-sm text-ink-secondary">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={aceitou}
            onChange={(event) => setAceitou(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-100"
          />
          <span>
            Aceito o tratamento dos meus dados pessoais para efeitos de inscrição, validação
            documental e organização da formação.
          </span>
        </label>

        {estado?.errors?.terms ? (
          <p role="alert" className="text-sm text-error">
            {estado.errors.terms}
          </p>
        ) : null}
        {estado?.message && !estado.ok ? (
          <p
            role="alert"
            className="rounded-md border border-error/30 bg-error-bg px-3 py-2.5 text-sm text-error"
          >
            {estado.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pendente || !aceitou}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
        >
          <Send size={15} />
          {pendente ? 'A submeter…' : 'Submeter inscrição para validação.'}
        </button>
      </form>
    </section>
  );
}
