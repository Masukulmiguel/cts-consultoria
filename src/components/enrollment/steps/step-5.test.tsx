import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/actions/enrollment-wizard/step5', () => ({
  submitEnrollment: vi.fn(),
}));

import { Step5 } from './step-5';

function renderizar(): string {
  return renderToStaticMarkup(
    <Step5
      enrollmentId="e1"
      pessoais={{
        nome: 'Maria Silva',
        documento: 'BI 004512345LA041',
        dataNascimento: '1990-01-13',
        morada: 'Rua 1',
        municipio: 'Luanda',
        provincia: 'Luanda',
        telefone: '+244923000000',
        email: 'maria@cts.angola',
      }}
      documentos={{ frente: true, verso: true, fotografia: true, comprovativo: true }}
      curso={{ titulo: 'Contabilidade', nivel: 'Júnior', preco: '50.000,00 Kz' }}
      pagamento={{ metodo: '—', valor: '', referencia: null, data: null }}
    />,
  );
}

describe('Step5', () => {
  it('mostra o valor do curso uma única vez, sem repetir a moeda', () => {
    const markup = renderizar();
    const valor = (markup.match(/Valor<\/dt><dd[^>]*>([^<]*)<\/dd>/)?.[1] ?? '').replace(/ /g, ' ');

    expect(valor).toBe('50 000 Kz');
    expect(valor).not.toContain('Kz Kz');
  });
});
