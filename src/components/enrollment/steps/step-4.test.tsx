import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/actions/enrollment-wizard/step4', () => ({
  saveStep4: vi.fn(),
}));

vi.mock('@/lib/ocr/run-client-ocr', () => ({
  runProofOcr: vi.fn(),
}));

vi.mock('@/components/enrollment/file-dropzone', () => ({
  FileDropzone: () => <div data-dropzone="sim" />,
}));

import { Step4 } from './step-4';

function renderizar(valor: string): string {
  return renderToStaticMarkup(
    <Step4
      enrollmentId="e1"
      curso={{ titulo: 'Contabilidade', nivel: 'Júnior', preco: '50.000,00 Kz', resumo: null }}
      pagamento={{
        bank: 'Banco',
        express: 'Multicaixa Express',
        instructions: 'Siga as instruções',
      }}
      documento={null}
      metodo="EXPRESS"
      valor={valor}
      dataPagamento="2026-12-13"
      referencia=""
    />,
  );
}

function campoAmount(markup: string): string {
  return markup.match(/<input[^>]*name="amount"[^>]*>/)?.[0] ?? '';
}

describe('Step4', () => {
  it('mantém os radios de método dentro do formulário', () => {
    const markup = renderizar('50.000,00 Kz');

    const inicio = markup.indexOf('<form');
    const fim = markup.indexOf('</form>');
    const radios = [...markup.matchAll(/name="method"/g)].map((achado) => achado.index ?? -1);

    expect(inicio).toBeGreaterThan(-1);
    expect(fim).toBeGreaterThan(inicio);
    expect(radios).toHaveLength(2);
    for (const posicao of radios) {
      expect(posicao).toBeGreaterThan(inicio);
      expect(posicao).toBeLessThan(fim);
    }
  });

  it('preenche o valor pago com um número válido quando o preço vem formatado', () => {
    const campo = campoAmount(renderizar('50.000,00 Kz'));

    expect(campo).toMatch(/type="number"/);
    expect(campo).toMatch(/value="50000"/);
  });

  it('preenche o valor pago com um número válido quando já existe pagamento registado', () => {
    const campo = campoAmount(renderizar('50 000,00'));

    expect(campo).toMatch(/value="50000"/);
  });
});
