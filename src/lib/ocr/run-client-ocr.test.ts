import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createWorkerMock, recognizeMock, terminateMock } = vi.hoisted(() => {
  const recognize = vi.fn(async () => ({ data: { text: '', confidence: 0 } }));
  const terminate = vi.fn(async () => ({ terminated: true }));
  const createWorker = vi.fn(async () => ({ recognize, terminate }));
  return { createWorkerMock: createWorker, recognizeMock: recognize, terminateMock: terminate };
});

vi.mock('tesseract.js', () => ({ createWorker: createWorkerMock }));

import { parseAmountKz } from './extract-amount';
import { runIdentityOcr, runProofOcr } from './run-client-ocr';

const ficheiro = new File(['conteudo'], 'bi.jpg', { type: 'image/jpeg' });

beforeEach(() => {
  vi.clearAllMocks();
  recognizeMock.mockResolvedValue({ data: { text: '', confidence: 0 } });
});

describe('runIdentityOcr', () => {
  it('devolve a confiança entre 0 e 1 e o texto bruto', async () => {
    recognizeMock.mockResolvedValue({
      data: {
        text: 'REPÚBLICA DE ANGOLA\nMARIA JOSE SILVA\n004512345LA041\n13/01/1990',
        confidence: 87,
      },
    });

    const resultado = await runIdentityOcr(ficheiro);

    expect(resultado.confidence).toBeGreaterThan(0);
    expect(resultado.confidence).toBeLessThanOrEqual(1);
    expect(resultado.raw).toContain('MARIA JOSE SILVA');
  });

  it('extrai nome, BI e data de nascimento', async () => {
    recognizeMock.mockResolvedValue({
      data: {
        text: 'REPÚBLICA DE ANGOLA\nMARIA JOSE SILVA\n004512345LA041\n13/01/1990',
        confidence: 90,
      },
    });

    const resultado = await runIdentityOcr(ficheiro);

    expect(resultado.fullName).toBe('MARIA JOSE SILVA');
    expect(resultado.biNumber).toBe('004512345LA041');
    expect(resultado.birthDate).toBe('13/01/1990');
  });

  it('devolve fullName undefined quando o texto não tem padrão reconhecível', async () => {
    recognizeMock.mockResolvedValue({ data: { text: 'BI\n123456789', confidence: 40 } });

    const resultado = await runIdentityOcr(ficheiro);

    expect(resultado.fullName).toBeUndefined();
  });

  it('devolve confidence 0 e raw vazio quando o worker falha', async () => {
    recognizeMock.mockRejectedValue(new Error('worker caiu'));

    const resultado = await runIdentityOcr(ficheiro);

    expect(resultado).toEqual({ confidence: 0, raw: '' });
  });

  it('termina o worker no fim', async () => {
    await runIdentityOcr(ficheiro);

    expect(terminateMock).toHaveBeenCalledTimes(1);
  });

  it('cria o worker com português e inglês', async () => {
    await runIdentityOcr(ficheiro);

    expect(createWorkerMock).toHaveBeenCalledWith('por+eng');
  });
});

describe('runProofOcr', () => {
  it('usa parseAmountKz para o valor', async () => {
    recognizeMock.mockResolvedValue({
      data: { text: 'COMPROVATIVO\nValor: 75.000,00 Kz\nData: 01/12/2026', confidence: 75 },
    });

    const resultado = await runProofOcr(ficheiro);

    expect(resultado.amount).toBeDefined();
    expect(parseAmountKz(resultado.amount as string)).toBe(75000);
  });

  it('extrai a data de pagamento', async () => {
    recognizeMock.mockResolvedValue({
      data: { text: 'COMPROVATIVO\nValor: 75.000,00 Kz\nData: 01/12/2026', confidence: 75 },
    });

    const resultado = await runProofOcr(ficheiro);

    expect(resultado.paymentDate).toBe('01/12/2026');
  });

  it('devolve confidence 0 e raw vazio quando o worker falha', async () => {
    recognizeMock.mockRejectedValue(new Error('worker caiu'));

    const resultado = await runProofOcr(ficheiro);

    expect(resultado).toEqual({ confidence: 0, raw: '' });
  });
});
