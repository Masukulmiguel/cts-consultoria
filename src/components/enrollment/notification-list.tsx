'use client';

import { markNotificationRead } from '@/actions/enrollment-wizard/notifications';
import { Bell, Check } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';

export type Notificacao = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  /** Data ISO (UTC) para evitar diferenças de fuso entre servidor e cliente. */
  createdAt: string;
};

function data(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Africa/Luanda',
  });
}

/** Lista de notificações internas por ler, no topo da área do formando. */
export function NotificationList({ notifications }: { notifications: Notificacao[] }) {
  const [restantes, setRestantes] = useState(notifications);
  const [pendente, iniciar] = useTransition();

  if (restantes.length === 0) return null;

  function marcarComoLida(id: string) {
    iniciar(async () => {
      await markNotificationRead(id);
      setRestantes((actuais) => actuais.filter((item) => item.id !== id));
    });
  }

  return (
    <section aria-label="Notificações" className="mb-8 space-y-3">
      {restantes.map((notificacao) => (
        <article
          key={notificacao.id}
          className="card flex flex-wrap items-start gap-4 border-l-4 border-l-primary-500 p-5"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <Bell size={16} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-sm font-semibold text-ink">{notificacao.title}</h2>
              <p className="text-2xs uppercase tracking-[0.14em] text-ink-muted">
                {data(notificacao.createdAt)}
              </p>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{notificacao.body}</p>
            {notificacao.href ? (
              <Link
                href={notificacao.href}
                className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Ver detalhe
              </Link>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => marcarComoLida(notificacao.id)}
            disabled={pendente}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-ink-secondary transition-colors hover:border-primary-300 hover:text-primary-600 disabled:opacity-60"
          >
            <Check size={14} />
            Marcar como lida
          </button>
        </article>
      ))}
    </section>
  );
}
