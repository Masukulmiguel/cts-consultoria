import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { setting: { findMany: vi.fn() } },
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

import { SETTING_KEYS, getPaymentSettings } from './payment-settings';

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.setting.findMany.mockResolvedValue([]);
});

describe('getPaymentSettings', () => {
  it('devolve null quando a configuração não existe (sem inventar dados)', async () => {
    prismaMock.setting.findMany.mockResolvedValue([]);

    expect(await getPaymentSettings()).toEqual({
      bank: null,
      express: null,
      instructions: null,
    });
  });

  it('nunca devolve IBAN por defeito', async () => {
    prismaMock.setting.findMany.mockResolvedValue([]);

    const result = await getPaymentSettings();

    expect(result.bank).toBeNull();
    expect(result.express).toBeNull();
    expect(result.instructions).toBeNull();
  });

  it('lê as três chaves configuradas pelo admin', async () => {
    prismaMock.setting.findMany.mockResolvedValue([
      { key: 'payment.bank', value: 'Banco: BAI — AO06 0000 0000 0000 0000 0000 0' },
      { key: 'payment.express', value: 'Multicaixa Express: 923 000 000' },
      { key: 'payment.instructions', value: 'Efectue a transferência e envie o comprovativo.' },
    ]);

    expect(await getPaymentSettings()).toEqual({
      bank: 'Banco: BAI — AO06 0000 0000 0000 0000 0000 0',
      express: 'Multicaixa Express: 923 000 000',
      instructions: 'Efectue a transferência e envie o comprovativo.',
    });
  });

  it('pede exactamente as três chaves de configuração', async () => {
    await getPaymentSettings();

    expect(prismaMock.setting.findMany).toHaveBeenCalledWith({
      where: {
        key: {
          in: [SETTING_KEYS.bank, SETTING_KEYS.express, SETTING_KEYS.instructions],
        },
      },
    });
  });

  it('aceita o valor guardado como objecto com a propriedade value', async () => {
    prismaMock.setting.findMany.mockResolvedValue([
      { key: 'payment.bank', value: { value: 'Banco: BAI' } },
    ]);

    expect((await getPaymentSettings()).bank).toBe('Banco: BAI');
  });

  it('ignora chaves desconhecidas e valores vazios', async () => {
    prismaMock.setting.findMany.mockResolvedValue([
      { key: 'payment.bank', value: '   ' },
      { key: 'outra.coisa', value: 'ignorar' },
    ]);

    expect(await getPaymentSettings()).toEqual({
      bank: null,
      express: null,
      instructions: null,
    });
  });
});
