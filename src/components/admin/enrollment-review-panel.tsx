'use client';

import {
  approveEnrollment,
  assignReviewer,
  rejectEnrollment,
  requestCorrection,
  reviewDocument,
  reviewPayment,
} from '@/actions/admin/enrollment-review';
import { OcrComparisonTable } from '@/components/enrollment/ocr-comparison-table';
import type { ComparedField } from '@/lib/ocr/compare';
import { useActionState, useState, useTransition } from 'react';

type EstadoAcao = { ok: boolean; message?: string } | null;

export type DocumentoPainel = {
  id: string;
  kind: string;
  rotulo: string;
  reviewStatus: string;
  previewUrl: string | null;
  ocrStatus: string;
  ocrConfidence: number | null;
  ocrTexto: string | null;
  comparacao: ComparedField[];
  rejectionReason: string | null;
};

export type PainelEnrollment = {
  enrollmentId: string;
  status: string;
  role: string;
  pessoais: {
    nome: string;
    nif: string;
    biNumber: string;
    dataNascimento: string;
    morada: string;
    municipio: string;
    provincia: string;
    telefone: string;
    email: string;
  };
  documentos: DocumentoPainel[];
  pagamento: {
    metodo: string;
    valor: string;
    referencia: string;
    data: string;
    reviewStatus: string;
    rejectionReason: string | null;
    ocrExtract: string | null;
  } | null;
  curso: {
    titulo: string;
    nivel: string;
    familia: string;
    duracao: string;
    preco: string;
    resumo: string;
  };
  historico: {
    fromStatus: string | null;
    toStatus: string;
    actorRole: string | null;
    reason: string | null;
    createdAt: string;
  }[];
  revisores: { id: string; nome: string }[];
};

const ABAS = [
  { chave: 'pessoais', label: 'Dados pessoais' },
  { chave: 'documentos', label: 'Documentos' },
  { chave: 'pagamento', label: 'Pagamento' },
  { chave: 'curso', label: 'Curso' },
  { chave: 'historico', label: 'Histórico' },
] as const;

const ESTADOS_REVISAO: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Por rever', className: 'bg-surface-subtle text-ink-secondary' },
  MATCHED: { label: 'Coincide', className: 'bg-info-bg text-info' },
  DIVERGENT: { label: 'Divergente', className: 'bg-warning-bg text-warning' },
  NOT_READABLE: { label: 'Não legível', className: 'bg-warning-bg text-warning' },
  APPROVED: { label: 'Aprovado', className: 'bg-success-bg text-success' },
  REJECTED: { label: 'Rejeitado', className: 'bg-error-bg text-error' },
};

function data(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Africa/Luanda',
  });
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-2 last:border-b-0">
      <dt className="text-xs uppercase tracking-[0.12em] text-white/50">{rotulo}</dt>
      <dd className="text-right text-sm text-white">{valor || '—'}</dd>
    </div>
  );
}

export function EnrollmentReviewPanel({ painel }: { painel: PainelEnrollment }) {
  const [aba, setAba] = useState<(typeof ABAS)[number]['chave']>('documentos');
  const [campos, setCampos] = useState('');

  const [estadoDocumento, submeterDocumento, pendenteDocumento] = useActionState<
    EstadoAcao,
    FormData
  >(async (prev, formData) => {
    const decision = String(formData.get('decision') ?? 'PENDING');
    return reviewDocument({
      enrollmentId: painel.enrollmentId,
      documentId: String(formData.get('documentId') ?? ''),
      decision: decision as 'APPROVED' | 'REJECTED' | 'DIVERGENT' | 'NOT_READABLE',
      reason: String(formData.get('reason') ?? ''),
    });
  }, null);

  const [estadoPagamento, submeterPagamento, pendentePagamento] = useActionState<
    EstadoAcao,
    FormData
  >(
    async (prev, formData) =>
      reviewPayment({
        enrollmentId: painel.enrollmentId,
        decision: String(formData.get('decision') ?? 'APPROVED') as 'APPROVED' | 'REJECTED',
        reason: String(formData.get('reason') ?? ''),
      }),
    null,
  );

  const [estadoCorreccao, submeterCorreccao, pendenteCorreccao] = useActionState<
    { ok: boolean } | null,
    FormData
  >(
    async (prev, formData) =>
      requestCorrection({
        enrollmentId: painel.enrollmentId,
        fields: String(formData.get('fields') ?? '')
          .split(',')
          .map((campo) => campo.trim())
          .filter(Boolean),
        message: String(formData.get('message') ?? ''),
      }),
    null,
  );

  const [estadoAprovacao, submeterAprovacao, pendenteAprovacao] = useActionState<
    EstadoAcao,
    FormData
  >(
    async (prev, formData) =>
      approveEnrollment({
        enrollmentId: painel.enrollmentId,
        reason: String(formData.get('reason') ?? ''),
      }),
    null,
  );

  const [estadoAtribuicao, submeterAtribuicao, pendenteAtribuicao] = useActionState<
    { ok: boolean } | null,
    FormData
  >(
    async (prev, formData) =>
      assignReviewer({
        enrollmentId: painel.enrollmentId,
        reviewerId: String(formData.get('reviewerId') ?? ''),
      }),
    null,
  );

  const [pendenteRecusa, iniciarRecusa] = useTransition();
  const [mensagemRecusa, setMensagemRecusa] = useState<string | null>(null);

  const podeAprovarPagamento = painel.role !== 'SUPPORT';

  async function recusar() {
    const motivo = window.prompt('Motivo da recusa da inscrição:');
    if (!motivo?.trim()) return;
    iniciarRecusa(async () => {
      const resultado = await rejectEnrollment({
        enrollmentId: painel.enrollmentId,
        reason: motivo,
      });
      setMensagemRecusa(
        resultado.ok ? 'Inscrição recusada.' : 'Não foi possível recusar a inscrição.',
      );
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {ABAS.map((item) => (
          <button
            key={item.chave}
            type="button"
            onClick={() => setAba(item.chave)}
            aria-current={aba === item.chave ? 'page' : undefined}
            className={`rounded-pill px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              aba === item.chave
                ? 'bg-primary-600 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {aba === 'pessoais' ? (
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <dl>
            <Linha rotulo="Nome" valor={painel.pessoais.nome} />
            <Linha rotulo="NIF" valor={painel.pessoais.nif} />
            <Linha rotulo="Bilhete de Identidade" valor={painel.pessoais.biNumber} />
            <Linha rotulo="Data de nascimento" valor={painel.pessoais.dataNascimento} />
            <Linha rotulo="Morada" valor={painel.pessoais.morada} />
            <Linha rotulo="Município" valor={painel.pessoais.municipio} />
            <Linha rotulo="Província" valor={painel.pessoais.provincia} />
            <Linha rotulo="Telefone" valor={painel.pessoais.telefone} />
            <Linha rotulo="E-mail" valor={painel.pessoais.email} />
          </dl>
        </section>
      ) : null}

      {aba === 'documentos' ? (
        <section className="space-y-4">
          {estadoDocumento?.message ? (
            <p role="alert" className="rounded-md bg-white/10 px-3 py-2 text-sm text-white">
              {estadoDocumento.message}
            </p>
          ) : null}

          {painel.documentos.map((documento) => {
            const estado = ESTADOS_REVISAO[documento.reviewStatus] ?? ESTADOS_REVISAO.PENDING;
            return (
              <article
                key={documento.id}
                className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-5 lg:grid-cols-[minmax(0,18rem)_1fr]"
              >
                <div>
                  {documento.previewUrl ? (
                    <img
                      src={documento.previewUrl}
                      alt={`Documento ${documento.rotulo}`}
                      className="w-full rounded-md border border-white/10 object-contain"
                    />
                  ) : (
                    <div className="rounded-md border border-dashed border-white/20 px-4 py-8 text-center text-xs text-white/50">
                      Sem pré-visualização
                    </div>
                  )}
                  {documento.ocrTexto ? (
                    <details className="mt-3 text-xs text-white/60">
                      <summary className="cursor-pointer">Texto lido pelo OCR</summary>
                      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-black/30 p-2 text-[0.7rem]">
                        {documento.ocrTexto}
                      </pre>
                    </details>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{documento.rotulo}</h3>
                    <span
                      className={`inline-flex rounded-pill px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.12em] ${estado.className}`}
                    >
                      {estado.label}
                    </span>
                    {documento.ocrConfidence !== null ? (
                      <span className="text-2xs uppercase tracking-[0.12em] text-white/45">
                        OCR {Math.round(documento.ocrConfidence * 100)}%
                      </span>
                    ) : null}
                  </div>

                  {documento.comparacao.length > 0 ? (
                    <div className="rounded-md bg-white p-3">
                      <OcrComparisonTable comparison={documento.comparacao} />
                    </div>
                  ) : null}

                  {documento.rejectionReason ? (
                    <p className="text-xs text-error">Motivo: {documento.rejectionReason}</p>
                  ) : null}

                  <form action={submeterDocumento} className="space-y-2">
                    <input type="hidden" name="documentId" value={documento.id} />
                    <input
                      name="reason"
                      placeholder="Motivo (obrigatório para rejeitar)"
                      className="w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-primary-400 focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        name="decision"
                        value="APPROVED"
                        disabled={pendenteDocumento}
                        className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Aprovar
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="REJECTED"
                        disabled={pendenteDocumento}
                        className="rounded-md bg-error px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Rejeitar
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="DIVERGENT"
                        disabled={pendenteDocumento}
                        className="rounded-md bg-warning px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Divergente
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="NOT_READABLE"
                        disabled={pendenteDocumento}
                        className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Não legível
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {aba === 'pagamento' ? (
        <section className="space-y-4 rounded-lg border border-white/10 bg-white/[0.03] p-5">
          {!painel.pagamento ? (
            <p className="text-sm text-white/60">Ainda não há comprovativo de pagamento.</p>
          ) : (
            <>
              <dl>
                <Linha rotulo="Método" valor={painel.pagamento.metodo} />
                <Linha rotulo="Valor" valor={painel.pagamento.valor} />
                <Linha rotulo="Referência" valor={painel.pagamento.referencia} />
                <Linha rotulo="Estado da revisão" valor={painel.pagamento.reviewStatus} />
              </dl>

              {painel.pagamento.ocrExtract ? (
                <details className="text-xs text-white/60">
                  <summary className="cursor-pointer">Leitura automática do comprovativo</summary>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-black/30 p-2 text-[0.7rem]">
                    {painel.pagamento.ocrExtract}
                  </pre>
                </details>
              ) : null}

              {estadoPagamento?.message ? (
                <p role="alert" className="rounded-md bg-white/10 px-3 py-2 text-sm text-white">
                  {estadoPagamento.message}
                </p>
              ) : null}

              <form action={submeterPagamento} className="space-y-2">
                <input
                  name="reason"
                  placeholder="Motivo (obrigatório para rejeitar)"
                  className="w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-primary-400 focus:outline-none"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    name="decision"
                    value="APPROVED"
                    disabled={pendentePagamento || !podeAprovarPagamento}
                    title={
                      podeAprovarPagamento
                        ? undefined
                        : 'O papel SUPPORT não pode aprovar o pagamento.'
                    }
                    className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Confirmar pagamento
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="REJECTED"
                    disabled={pendentePagamento}
                    className="rounded-md bg-error px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Rejeitar pagamento
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      ) : null}

      {aba === 'curso' ? (
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <dl>
            <Linha rotulo="Curso" valor={painel.curso.titulo} />
            <Linha rotulo="Área" valor={painel.curso.familia} />
            <Linha rotulo="Nível" valor={painel.curso.nivel} />
            <Linha rotulo="Duração" valor={painel.curso.duracao} />
            <Linha rotulo="Investimento" valor={painel.curso.preco} />
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-white/70">{painel.curso.resumo}</p>
        </section>
      ) : null}

      {aba === 'historico' ? (
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          {painel.historico.length === 0 ? (
            <p className="text-sm text-white/60">Sem alterações de estado registadas.</p>
          ) : (
            <ol className="space-y-3">
              {painel.historico.map((registo, indice) => (
                <li
                  key={`${registo.createdAt}-${indice}`}
                  className="border-l border-white/15 pl-4"
                >
                  <p className="text-sm text-white">
                    {registo.fromStatus ? `${registo.fromStatus} → ` : ''}
                    <span className="font-semibold">{registo.toStatus}</span>
                  </p>
                  <p className="text-xs text-white/50">
                    {data(registo.createdAt)}
                    {registo.actorRole ? ` · ${registo.actorRole}` : ''}
                  </p>
                  {registo.reason ? (
                    <p className="mt-1 text-xs text-white/70">{registo.reason}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}

      <section className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-5 lg:grid-cols-2">
        <form action={submeterCorreccao} className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Pedir correcções</h3>
          <input
            name="fields"
            value={campos}
            onChange={(event) => setCampos(event.target.value)}
            placeholder="Campos a corrigir (separados por vírgula)"
            className="w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-primary-400 focus:outline-none"
          />
          <textarea
            name="message"
            rows={2}
            placeholder="Mensagem ao formando"
            className="w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-primary-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pendenteCorreccao}
            className="rounded-md bg-warning px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            Pedir correcções
          </button>
        </form>

        <div className="space-y-3">
          <form action={submeterAprovacao} className="space-y-2">
            <h3 className="text-sm font-semibold text-white">Aprovar inscrição</h3>
            <input
              name="reason"
              placeholder="Observação (opcional)"
              className="w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-primary-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={pendenteAprovacao}
              className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              Aprovar inscrição
            </button>
            {estadoAprovacao?.message ? (
              <p role="alert" className="text-xs text-warning">
                {estadoAprovacao.message}
              </p>
            ) : null}
          </form>

          <form action={submeterAtribuicao} className="space-y-2">
            <h3 className="text-sm font-semibold text-white">Atribuir validação</h3>
            <select
              name="reviewerId"
              defaultValue=""
              className="w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
            >
              <option value="">Escolha o revisor</option>
              {painel.revisores.map((revisor) => (
                <option key={revisor.id} value={revisor.id}>
                  {revisor.nome}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={pendenteAtribuicao}
              className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              Atribuir
            </button>
          </form>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white">Recusar inscrição</h3>
            <button
              type="button"
              onClick={recusar}
              disabled={pendenteRecusa}
              className="rounded-md bg-error px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              Recusar
            </button>
            {mensagemRecusa ? <p className="text-xs text-white/60">{mensagemRecusa}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
