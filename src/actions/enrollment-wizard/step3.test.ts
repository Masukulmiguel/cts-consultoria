import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, authMock, notFoundMock, uploadMock } = vi.hoisted(() => {
  const upload = vi.fn(async () => ({ data: { path: 'u1/e1/PHOTO' }, error: null }));
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

import { saveStep3 } from './step3';

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);

function inscricao() {
  return {
    id: 'e1',
    userId: 'u1',
    status: 'DRAFT',
    currentStep: 3,
    user: { id: 'u1', name: 'Maria Silva', email: 'maria@cts.angola', studentProfile: null },
    documents: [],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SUPABASE_URL', 'https://project.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
  authMock.mockResolvedValue({ user: { id: 'u1', role: 'STUDENT' } });
  prismaMock.enrollment.findUnique.mockResolvedValue(inscricao());
  uploadMock.mockResolvedValue({ data: { path: 'u1/e1/PHOTO' }, error: null });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('saveStep3', () => {
  it('carrega a fotografia com o kind PHOTO e devolve o passo 4', async () => {
    const ficheiro = new File([jpeg], 'foto.jpg', { type: 'image/jpeg' });

    const resultado = await saveStep3(
      'e1',
      null,
      (() => {
        const data = new FormData();
        data.append('file', ficheiro);
        return data;
      })(),
    );

    expect(resultado).toEqual({ ok: true, nextStep: 4 });
    const [chave] = uploadMock.mock.calls[0] as unknown as [string];
    expect(chave).toBe('u1/e1/PHOTO');
    expect(prismaMock.enrollmentDocument.upsert.mock.calls[0][0].create).toMatchObject({
      kind: 'PHOTO',
      storageKey: 'u1/e1/PHOTO',
      reviewStatus: 'PENDING',
    });
    expect(prismaMock.enrollment.update).toHaveBeenCalledWith({
      where: { id: 'e1' },
      data: { currentStep: 4 },
    });
  });

  it('rejeita um ficheiro que não é imagem nem PDF', async () => {
    const ficheiro = new File([zip], 'foto.jpg', { type: 'image/jpeg' });
    const data = new FormData();
    data.append('file', ficheiro);

    const resultado = await saveStep3('e1', null, data);

    expect(resultado.ok).toBe(false);
    expect(resultado.errors?.file).toBeTruthy();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('não grava dados de OCR na fotografia', async () => {
    const ficheiro = new File([jpeg], 'foto.jpg', { type: 'image/jpeg' });
    const data = new FormData();
    data.append('file', ficheiro);
    data.append('ocrRaw', 'texto inventado');

    await saveStep3('e1', null, data);

    const args = prismaMock.enrollmentDocument.upsert.mock.calls[0][0];
    expect(args.create.ocrStatus).toBe('NOT_RUN');
    expect(args.create.ocrRaw ?? null).toBeNull();
  });
});
