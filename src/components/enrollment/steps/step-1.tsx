'use client';

import type { WizardActionResult } from '@/actions/enrollment-wizard/common';
import { saveStep1 } from '@/actions/enrollment-wizard/step1';
import { PROVINCES, municipalitiesFor } from '@/content/angola-locations';
import { ArrowRight, Check, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState } from 'react';

const FIELD =
  'w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-ink shadow-xs transition placeholder:text-ink-muted focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100';

export type Step1Valores = {
  primaryDocumentType: 'NIF' | 'BI';
  nif: string;
  biNumber: string;
  fullName: string;
  birthDate: string;
  address: string;
  municipality: string;
  province: string;
  phone: string;
  email: string;
};

type Props = {
  enrollmentId: string;
  valores: Step1Valores;
  provinciaInicial: string;
};

export function Step1({ enrollmentId, valores, provinciaInicial }: Props) {
  const router = useRouter();
  const [estado, submeter, pendente] = useActionState<WizardActionResult | null, FormData>(
    async (prev, formData) => saveStep1(enrollmentId, prev, formData),
    null,
  );
  const [dados, setDados] = useState<Step1Valores>(valores);
  const [confirmando, setConfirmando] = useState(false);
  const [provincia, setProvincia] = useState(provinciaInicial);

  const municipios = useMemo(() => municipalitiesFor(provincia), [provincia]);

  useEffect(() => {
    if (estado?.ok && estado.nextStep) {
      router.push(`/pt/aluno/inscricao/${enrollmentId}/etapa/${estado.nextStep}`);
    }
  }, [estado, enrollmentId, router]);

  function alterar(campo: keyof Step1Valores, valor: string) {
    setDados((actual) => ({ ...actual, [campo]: valor }));
  }

  function escolherProvincia(codigo: string) {
    setProvincia(codigo);
    const escolhida = PROVINCES.find((p) => p.code === codigo);
    setDados((actual) => ({
      ...actual,
      province: escolhida?.name ?? '',
      municipality: '',
    }));
  }

  const resumo = [
    ['Tipo de documento', dados.primaryDocumentType === 'NIF' ? 'NIF' : 'Bilhete de Identidade'],
    ['Número', dados.primaryDocumentType === 'NIF' ? dados.nif : dados.biNumber],
    ['Nome completo', dados.fullName],
    ['Data de nascimento', dados.birthDate],
    ['Morada', dados.address],
    ['Município', dados.municipality],
    ['Província', dados.province],
    ['Telefone', dados.phone],
    ['E-mail', dados.email],
  ];

  return (
    <section className="card p-6">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Vamos confirmar a sua identidade.
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
        Introduza o seu NIF ou número do Bilhete de Identidade para preencher os seus dados pessoais
        e iniciar a validação da inscrição.
      </p>

      <form action={submeter} className="mt-6 space-y-4">
        <div hidden={confirmando}>
          <fieldset className="rounded-lg border border-border p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Documento de identificação
            </legend>

            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-ink">
                Tipo de documento
                <select
                  name="primaryDocumentType"
                  value={dados.primaryDocumentType}
                  onChange={(event) =>
                    alterar('primaryDocumentType', event.target.value as 'NIF' | 'BI')
                  }
                  className={`${FIELD} mt-1.5`}
                >
                  <option value="NIF">NIF</option>
                  <option value="BI">Bilhete de Identidade</option>
                </select>
              </label>

              {dados.primaryDocumentType === 'NIF' ? (
                <label className="block text-sm font-medium text-ink">
                  Número de NIF
                  <input
                    name="nif"
                    inputMode="numeric"
                    required
                    value={dados.nif}
                    onChange={(event) => alterar('nif', event.target.value)}
                    className={`${FIELD} mt-1.5`}
                  />
                </label>
              ) : (
                <label className="block text-sm font-medium text-ink">
                  Número do Bilhete de Identidade
                  <input
                    name="biNumber"
                    required
                    value={dados.biNumber}
                    onChange={(event) => alterar('biNumber', event.target.value)}
                    className={`${FIELD} mt-1.5`}
                  />
                </label>
              )}
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Nome completo
              <input
                name="fullName"
                required
                minLength={2}
                value={dados.fullName}
                onChange={(event) => alterar('fullName', event.target.value)}
                className={`${FIELD} mt-1.5`}
              />
            </label>

            <label className="block text-sm font-medium text-ink">
              Data de nascimento
              <input
                name="birthDate"
                type="date"
                required
                value={dados.birthDate}
                onChange={(event) => alterar('birthDate', event.target.value)}
                className={`${FIELD} mt-1.5`}
              />
            </label>

            <label className="block text-sm font-medium text-ink sm:col-span-2">
              Morada
              <input
                name="address"
                required
                value={dados.address}
                onChange={(event) => alterar('address', event.target.value)}
                className={`${FIELD} mt-1.5`}
              />
            </label>

            <label className="block text-sm font-medium text-ink">
              Província
              <select
                name="provinceCode"
                value={provincia}
                onChange={(event) => escolherProvincia(event.target.value)}
                className={`${FIELD} mt-1.5`}
              >
                <option value="">Escolha a província</option>
                {PROVINCES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="municipio" className="block text-sm font-medium text-ink">
              Município
              {municipios.length > 0 ? (
                <select
                  id="municipio"
                  name="municipality"
                  required
                  value={dados.municipality}
                  onChange={(event) => alterar('municipality', event.target.value)}
                  className={`${FIELD} mt-1.5`}
                >
                  <option value="">Escolha o município</option>
                  {municipios.map((item) => (
                    <option key={item.code} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="municipio"
                  name="municipality"
                  required
                  value={dados.municipality}
                  onChange={(event) => alterar('municipality', event.target.value)}
                  className={`${FIELD} mt-1.5`}
                />
              )}
            </label>

            <input type="hidden" name="province" value={dados.province} />

            <label className="block text-sm font-medium text-ink">
              Telefone
              <input
                name="phone"
                type="tel"
                required
                value={dados.phone}
                onChange={(event) => alterar('phone', event.target.value)}
                className={`${FIELD} mt-1.5`}
              />
            </label>

            <label className="block text-sm font-medium text-ink">
              E-mail
              <input
                name="email"
                type="email"
                required
                value={dados.email}
                onChange={(event) => alterar('email', event.target.value)}
                className={`${FIELD} mt-1.5`}
              />
            </label>
          </div>
        </div>

        {confirmando ? (
          <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
            <h2 className="text-sm font-semibold text-ink">Confirme os seus dados</h2>
            <p className="mt-1 text-xs text-ink-secondary">
              Verifique cada campo antes de continuar. Depois de submeter, os dados só podem ser
              alterados pela secretaria.
            </p>
            <dl className="mt-3 divide-y divide-primary-100">
              {resumo.map(([rotulo, valor]) => (
                <div key={rotulo} className="flex items-start justify-between gap-4 py-2">
                  <dt className="text-xs font-medium uppercase tracking-[0.1em] text-ink-muted">
                    {rotulo}
                  </dt>
                  <dd className="text-right text-sm text-ink">{valor || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {estado?.errors ? (
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
            className="rounded-md border border-error/30 bg-error-bg px-3 py-2.5 text-sm text-error"
          >
            {estado.message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {confirmando ? (
            <>
              <button
                type="submit"
                disabled={pendente}
                className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
              >
                <Check size={15} />
                Confirmar e continuar
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:border-primary-300 hover:text-primary-600"
              >
                <Pencil size={14} />
                Corrigir dados
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              Continuar
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
