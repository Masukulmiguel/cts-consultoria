import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, authMock, notFoundMock, uploadMock } = vi.hoisted(() => {
  const upload = vi.fn(async () => ({ data: { path: 'u1/e1/BI_FRONT' }, error: null }));
  return {
    prismaMock: {
      enrollment: { findUnique: vi.fn(), update: vi.fn() },
      enrollmentDocument: { upsert: vi.fn() },
    },
    authMock: vi.fn(),
    notFoundMock: vi.fn(() => {
      throw new Error('NEXT_NOT_FOUND');
    }),
    uploadMock: upload,
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/auth', () => ({ auth: authMock }));
vi.mock('next/navigation', () => ({ notFound: notFoundMock }));
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ storage: { from: vi.fn(() => ({ upload: uploadMock })) } })),
}));

import { saveStep2 } from './step2';

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function inscricao(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e1',
    userId: 'u1',
    status: 'DRAFT',
    currentStep: 2,
    user: {
      id: 'u1',
      name: 'Maria Silva',
      email: 'maria@cts.angola',
      studentProfile: {
        nif: null,
        biNumber: '004512345LA041',
        birthDate: new Date('1990-01-13T00:00:00.000Z'),
      },
    },
    documents: [],
    ...overrides,
  };
}

function formData(values: Record<string, string>, ficheiro?: File) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.append(key, value);
  if (ficheiro) data.append('file', ficheiro);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SUPABASE_URL', 'https://project.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
  authMock.mockResolvedValue({ user: { id: 'u1', role: 'STUDENT' } });
  prismaMock.enrollment.findUnique.mockResolvedValue(inscricao());
  uploadMock.mockResolvedValue({ data: { path: 'u1/e1/BI_FRONT' }, error: null });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('saveStep2', () => {
  it('rejeita um ficheiro cujos magic bytes não correspondem ao tipo declarado', async () => {
    const ficheiro = new File([png], 'bi.jpg', { type: 'image/jpeg' });

    const resultado = await saveStep2('e1', null, formData({ kind: 'BI_FRONT' }, ficheiro));

    expect(resultado.ok).toBe(false);
    expect(resultado.errors?.file).toMatch(/não corresponde ao tipo declarado/i);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('rejeita um ficheiro maior do que 8 MB', async () => {
    const grande = new Uint8Array(8 * 1024 * 1024 + 1);
    grande.set(jpeg, 0);
    const ficheiro = new File([grande], 'bi.jpg', { type: 'image/jpeg' });

    const resultado = await saveStep2('e1', null, formData({ kind: 'BI_FRONT' }, ficheiro));

    expect(resultado.ok).toBe(false);
    expect(resultado.errors?.file).toMatch(/8 MB/);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('grava o documento com o kind correcto e a storageKey do dono', async () => {
    const ficheiro = new File([jpeg], 'bi-frente.jpg', { type: 'image/jpeg' });

    const resultado = await saveStep2('e1', null, formData({ kind: 'BI_FRONT' }, ficheiro));

    expect(resultado.ok).toBe(true);
    expect(uploadMock).toHaveBeenCalledTimes(1);
    const [chave] = uploadMock.mock.calls[0] as unknown as [string];
    expect(chave).toBe('u1/e1/BI_FRONT');
    expect(prismaMock.enrollmentDocument.upsert).toHaveBeenCalledTimes(1);
    const args = prismaMock.enrollmentDocument.upsert.mock.calls[0][0];
    expect(args.where).toEqual({ enrollmentId_kind: { enrollmentId: 'e1', kind: 'BI_FRONT' } });
    expect(args.create).toMatchObject({
      enrollmentId: 'e1',
      kind: 'BI_FRONT',
      storageKey: 'u1/e1/BI_FRONT',
      mimeType: 'image/jpeg',
      reviewStatus: 'PENDING',
    });
    expect(args.create.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('devolve a comparação com os três campos e um outcome cada', async () => {
    const ficheiro = new File([jpeg], 'bi-frente.jpg', { type: 'image/jpeg' });

    const resultado = await saveStep2(
      'e1',
      null,
      formData(
        {
          kind: 'BI_FRONT',
          ocrFullName: 'MARIA SILVA',
          ocrBiNumber: '004512345 LA 041',
          ocrBirthDate: '13/01/1990',
          ocrConfidence: '0.91',
          ocrRaw: 'MARIA SILVA\n004512345LA041',
        },
        ficheiro,
      ),
    );

    expect(resultado.comparison).toHaveLength(3);
    for (const campo of resultado.comparison ?? []) {
      expect(['MATCH', 'DIFFERENT', 'UNKNOWN']).toContain(campo.outcome);
    }
    const nome = resultado.comparison?.find((campo) => campo.field === 'fullName');
    const bi = resultado.comparison?.find((campo) => campo.field === 'biNumber');
    const data = resultado.comparison?.find((campo) => campo.field === 'birthDate');
    expect(nome?.outcome).toBe('MATCH');
    expect(bi?.outcome).toBe('MATCH');
    expect(data?.outcome).toBe('MATCH');
  });

  it('não altera o estado da inscrição para APPROVED', async () => {
    const ficheiro = new File([jpeg], 'bi-frente.jpg', { type: 'image/jpeg' });

    await saveStep2('e1', null, formData({ kind: 'BI_FRONT' }, ficheiro));

    const chamadas = prismaMock.enrollment.update.mock.calls;
    for (const [args] of chamadas as unknown as Array<[{ data: { status?: string } }]>) {
      expect(args.data.status).not.toBe('APPROVED');
    }
    const args = prismaMock.enrollmentDocument.upsert.mock.calls[0][0];
    expect(args.create.reviewStatus).toBe('PENDING');
  });

  it('rejeita um tipo de documento desconhecido', async () => {
    const ficheiro = new File([jpeg], 'bi.jpg', { type: 'image/jpeg' });

    const resultado = await saveStep2('e1', null, formData({ kind: 'OUTRO' }, ficheiro));

    expect(resultado.ok).toBe(false);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('lança erro quando a inscrição é de outro utilizador', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(inscricao({ userId: 'outro' }));
    const ficheiro = new File([jpeg], 'bi.jpg', { type: 'image/jpeg' });

    await expect(saveStep2('e1', null, formData({ kind: 'BI_FRONT' }, ficheiro))).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
    expect(uploadMock).not.toHaveBeenCalled();
  });
});
