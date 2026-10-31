'use client';

import { removeResource, saveResource } from '@/actions/admin/content';
import { type ContentActionState, INITIAL_CONTENT_STATE } from '@/lib/admin/content-state';
import type { ResourceDef } from '@/lib/admin/resources';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { useActionState } from 'react';

export type ResourceFormProps = {
  resource: ResourceDef;
  record?: Record<string, unknown>;
  locale: string;
};

function initialValue(field: { name: string; type: string }, record?: Record<string, unknown>) {
  const value = record?.[field.name];
  if (value === null || value === undefined) return '';
  if (field.type === 'lines' && Array.isArray(value)) return value.join('\n');
  if (field.type === 'date' && value instanceof Date) return value.toISOString().slice(0, 10);
  if (field.type === 'date' && typeof value === 'string') return value.slice(0, 10);
  if (field.type === 'boolean') return value === true || value === 'true';
  return String(value);
}

export function ResourceForm({ resource, record, locale }: ResourceFormProps) {
  const [state, formAction, pending] = useActionState(saveResource, INITIAL_CONTENT_STATE);
  const [removeState, removeAction, removing] = useActionState(
    removeResource,
    INITIAL_CONTENT_STATE,
  );

  const base = `/${locale}/admin/${resource.key}`;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="resource" value={resource.key} />
        {record?.id ? <input type="hidden" name="id" value={String(record.id)} /> : null}

        <div className="grid gap-5 md:grid-cols-2">
          {resource.fields.map((field) => {
            const error = state.fieldErrors?.[field.name];
            const inputId = `field-${field.name}`;
            const value = initialValue(field, record);

            return (
              <div key={field.name} className={field.full ? 'md:col-span-2' : undefined}>
                <label htmlFor={inputId} className="block text-xs font-semibold text-white/70">
                  {field.label}
                  {field.required ? <span className="ml-1 text-accent-400">*</span> : null}
                </label>

                {field.type === 'boolean' ? (
                  <label className="mt-2 flex items-center gap-2 text-sm text-white/80">
                    <input
                      id={inputId}
                      name={field.name}
                      type="checkbox"
                      defaultChecked={value === true}
                      className="h-4 w-4 rounded border-[#2a3b5c] bg-[#0d1729] accent-[var(--color-primary-500)]"
                    />
                    Visível no site
                  </label>
                ) : field.type === 'textarea' ? (
                  <textarea
                    id={inputId}
                    name={field.name}
                    rows={4}
                    defaultValue={value as string}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-lg border border-[#1c2c49] bg-[#0d1729] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-primary-500 focus:outline-none"
                  />
                ) : field.type === 'lines' ? (
                  <textarea
                    id={inputId}
                    name={field.name}
                    rows={5}
                    defaultValue={value as string}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-lg border border-[#1c2c49] bg-[#0d1729] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-primary-500 focus:outline-none"
                  />
                ) : (
                  <input
                    id={inputId}
                    name={field.name}
                    type={
                      field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'
                    }
                    defaultValue={value as string}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-lg border border-[#1c2c49] bg-[#0d1729] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-primary-500 focus:outline-none"
                  />
                )}

                {field.help ? <p className="mt-1.5 text-xs text-white/40">{field.help}</p> : null}
                {error ? <p className="mt-1.5 text-xs text-accent-400">{error}</p> : null}
              </div>
            );
          })}
        </div>

        {state.status === 'error' ? (
          <p className="rounded-lg border border-accent-500/40 bg-accent-500/10 px-4 py-3 text-sm text-accent-300">
            {state.message}
          </p>
        ) : null}
        {state.status === 'success' ? (
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-500 disabled:opacity-50"
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {record?.id ? 'Guardar alterações' : 'Criar registo'}
          </button>
          <a
            href={base}
            className="inline-flex min-h-11 items-center rounded-lg border border-[#1c2c49] px-4 text-sm font-semibold text-white/75 transition-colors hover:border-white/30 hover:text-white"
          >
            Voltar à lista
          </a>
        </div>
      </form>

      {record?.id ? (
        <form action={removeAction} className="rounded-xl border border-[#1c2c49] bg-[#0d1729] p-5">
          <input type="hidden" name="resource" value={resource.key} />
          <input type="hidden" name="id" value={String(record.id)} />
          <p className="text-sm font-semibold text-white">Eliminar registo</p>
          <p className="mt-1 text-xs text-white/50">
            A eliminação é definitiva e fica registada na auditoria.
          </p>
          {removeState.status === 'error' ? (
            <p className="mt-3 text-xs text-accent-400">{removeState.message}</p>
          ) : null}
          {removeState.status === 'success' ? (
            <p className="mt-3 text-xs text-emerald-400">{removeState.message}</p>
          ) : null}
          <button
            type="submit"
            disabled={removing}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-accent-500/50 px-4 text-sm font-semibold text-accent-400 transition-colors hover:bg-accent-500/10 disabled:opacity-50"
          >
            {removing ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Eliminar
          </button>
        </form>
      ) : null}
    </div>
  );
}
