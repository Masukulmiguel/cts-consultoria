import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-ink">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-sm text-ink-muted">
        A página que procura não existe ou foi movida. Utilize o menu para continuar a navegar.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/pt" className="btn btn-primary">
          Voltar ao início
        </Link>
        <Link href="/pt/servicos" className="btn btn-outline">
          Ver serviços
        </Link>
      </div>
    </div>
  );
}
