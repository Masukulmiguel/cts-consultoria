import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, uploadMock, signedUrlMock, fromMock, createClientMock } = vi.hoisted(() => {
  const upload = vi.fn(async () => ({ data: { path: 'u1/e1/BI_FRONT' }, error: null }));
  const createSignedUrl = vi.fn(async () => ({
    data: { signedUrl: 'https://bucket.supabase.co/signed/u1/e1/BI_FRONT' },
    error: null,
  }));
  const from = vi.fn(() => ({ upload, createSignedUrl }));
  return {
    prismaMock: { enrollmentDocument: { findUnique: vi.fn() } },
    uploadMock: upload,
    signedUrlMock: createSignedUrl,
    fromMock: from,
    createClientMock: vi.fn(() => ({ storage: { from } })),
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@supabase/supabase-js', () => ({ createClient: createClientMock }));
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));

import { AuthError } from '@/lib/rbac';
import {
  assertOwnedDocument,
  createEnrollmentDocumentUrl,
  storageKeyFor,
  uploadEnrollmentDocument,
} from './enrollment-documents';

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SUPABASE_URL', 'https://project.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
  vi.stubEnv('SUPABASE_ENROLLMENT_BUCKET', 'enrollment-documents');
  prismaMock.enrollmentDocument.findUnique.mockResolvedValue({
    id: 'd1',
    enrollment: { userId: 'u1' },
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('storageKeyFor', () => {
  it('monta a chave com o dono, a inscrição e o tipo de documento', () => {
    expect(storageKeyFor('u1', 'e1', 'BI_FRONT')).toBe('u1/e1/BI_FRONT');
  });

  it('não inclui nome nem NIF', () => {
    expect(storageKeyFor('u1', 'e1', 'PHOTO')).not.toMatch(/maria|nif|123456789/i);
  });
});

describe('uploadEnrollmentDocument', () => {
  it('carrega o documento no bucket privado com a chave do dono', async () => {
    const resultado = await uploadEnrollmentDocument({
      enrollmentId: 'e1',
      userId: 'u1',
      kind: 'BI_FRONT',
      bytes: jpeg,
      declaredType: 'image/jpeg',
    });

    expect(fromMock).toHaveBeenCalledWith('enrollment-documents');
    expect(uploadMock).toHaveBeenCalledTimes(1);
    const [chave, corpo, opcoes] = uploadMock.mock.calls[0] as unknown as [
      string,
      unknown,
      { contentType: string; upsert: boolean },
    ];
    expect(chave).toBe('u1/e1/BI_FRONT');
    expect(opcoes).toMatchObject({ contentType: 'image/jpeg', upsert: true });
    expect(corpo).toBeDefined();
    expect(resultado).toMatchObject({
      storageKey: 'u1/e1/BI_FRONT',
      mimeType: 'image/jpeg',
      byteSize: jpeg.byteLength,
    });
  });

  it('devolve o sha256 do conteúdo', async () => {
    const resultado = await uploadEnrollmentDocument({
      enrollmentId: 'e1',
      userId: 'u1',
      kind: 'BI_FRONT',
      bytes: jpeg,
      declaredType: 'image/jpeg',
    });

    expect(resultado.sha256).toBe(createHash('sha256').update(jpeg).digest('hex'));
    expect(resultado.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('rejeita um ficheiro cujo conteúdo não corresponde ao tipo declarado', async () => {
    await expect(
      uploadEnrollmentDocument({
        enrollmentId: 'e1',
        userId: 'u1',
        kind: 'BI_FRONT',
        bytes: png,
        declaredType: 'image/jpeg',
      }),
    ).rejects.toThrow(/não corresponde ao tipo declarado/i);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('rejeita um conteúdo que não é imagem nem PDF', async () => {
    await expect(
      uploadEnrollmentDocument({
        enrollmentId: 'e1',
        userId: 'u1',
        kind: 'PROOF',
        bytes: zip,
        declaredType: 'application/zip',
      }),
    ).rejects.toThrow(/imagem|PDF/i);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('rejeita um ficheiro maior do que 8 MB', async () => {
    const grande = new Uint8Array(8 * 1024 * 1024 + 1);
    grande.set(jpeg, 0);

    await expect(
      uploadEnrollmentDocument({
        enrollmentId: 'e1',
        userId: 'u1',
        kind: 'PHOTO',
        bytes: grande,
        declaredType: 'image/jpeg',
      }),
    ).rejects.toThrow(/8 MB/);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('falha com mensagem clara quando o storage não está configurado', async () => {
    vi.stubEnv('SUPABASE_URL', '');

    await expect(
      uploadEnrollmentDocument({
        enrollmentId: 'e1',
        userId: 'u1',
        kind: 'BI_FRONT',
        bytes: jpeg,
        declaredType: 'image/jpeg',
      }),
    ).rejects.toThrow(/Storage não configurado/);
  });

  it('aceita SUPABASE_SECRET_KEY quando não há SUPABASE_SERVICE_ROLE_KEY', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', undefined);
    vi.stubEnv('SUPABASE_SECRET_KEY', 'secret-key');

    await uploadEnrollmentDocument({
      enrollmentId: 'e1',
      userId: 'u1',
      kind: 'BI_FRONT',
      bytes: jpeg,
      declaredType: 'image/jpeg',
    });

    expect(createClientMock).toHaveBeenCalledWith(
      'https://project.supabase.co',
      'secret-key',
      expect.anything(),
    );
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });

  it('prefere SUPABASE_SERVICE_ROLE_KEY quando ambas as chaves existem', async () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', 'secret-key');

    await uploadEnrollmentDocument({
      enrollmentId: 'e1',
      userId: 'u1',
      kind: 'BI_FRONT',
      bytes: jpeg,
      declaredType: 'image/jpeg',
    });

    expect(createClientMock).toHaveBeenCalledWith(
      'https://project.supabase.co',
      'service-role-key',
      expect.anything(),
    );
  });

  it('nomeia as duas chaves na mensagem de storage não configurado', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', undefined);
    vi.stubEnv('SUPABASE_SECRET_KEY', undefined);

    await expect(
      uploadEnrollmentDocument({
        enrollmentId: 'e1',
        userId: 'u1',
        kind: 'BI_FRONT',
        bytes: jpeg,
        declaredType: 'image/jpeg',
      }),
    ).rejects.toThrow(/SUPABASE_SERVICE_ROLE_KEY.*SUPABASE_SECRET_KEY/);
  });

  it('propaga o erro do storage', async () => {
    uploadMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'bucket não existe' },
    } as never);

    await expect(
      uploadEnrollmentDocument({
        enrollmentId: 'e1',
        userId: 'u1',
        kind: 'BI_FRONT',
        bytes: jpeg,
        declaredType: 'image/jpeg',
      }),
    ).rejects.toThrow(/bucket não existe/);
  });
});

describe('assertOwnedDocument', () => {
  it('permite o dono', () => {
    expect(() =>
      assertOwnedDocument({ userId: 'u1' }, { userId: 'u1', role: 'STUDENT' }),
    ).not.toThrow();
  });

  it('permite ADMIN, SUPER_ADMIN e SUPPORT', () => {
    for (const role of ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'] as const) {
      expect(() => assertOwnedDocument({ userId: 'u1' }, { userId: 'outro', role })).not.toThrow();
    }
  });

  it('recusa um formando que não é o dono', () => {
    expect(() =>
      assertOwnedDocument({ userId: 'u1' }, { userId: 'outro', role: 'STUDENT' }),
    ).toThrow(AuthError);
  });
});

describe('createEnrollmentDocumentUrl', () => {
  it('devolve URL assinada ao dono', async () => {
    const url = await createEnrollmentDocumentUrl('u1/e1/BI_FRONT', {
      userId: 'u1',
      role: 'STUDENT',
    });

    expect(url).toBe('https://bucket.supabase.co/signed/u1/e1/BI_FRONT');
    expect(signedUrlMock).toHaveBeenCalledWith('u1/e1/BI_FRONT', 600);
  });

  it('devolve URL assinada ao ADMIN', async () => {
    const url = await createEnrollmentDocumentUrl('u1/e1/BI_FRONT', {
      userId: 'admin',
      role: 'ADMIN',
    });

    expect(url).toContain('/signed/');
    expect(signedUrlMock).toHaveBeenCalledTimes(1);
  });

  it('devolve URL assinada ao SUPPORT', async () => {
    const url = await createEnrollmentDocumentUrl('u1/e1/BI_FRONT', {
      userId: 'suporte',
      role: 'SUPPORT',
    });

    expect(url).toContain('/signed/');
  });

  it('não deixa um formando ler o documento de outro', async () => {
    prismaMock.enrollmentDocument.findUnique.mockResolvedValue({
      id: 'd1',
      enrollment: { userId: 'outro' },
    });

    await expect(
      createEnrollmentDocumentUrl('outro/e1/BI_FRONT', { userId: 'u1', role: 'STUDENT' }),
    ).rejects.toThrow(AuthError);
    expect(signedUrlMock).not.toHaveBeenCalled();
  });

  it('falha quando o documento não existe', async () => {
    prismaMock.enrollmentDocument.findUnique.mockResolvedValue(null);

    await expect(
      createEnrollmentDocumentUrl('u1/e1/BI_FRONT', { userId: 'u1', role: 'STUDENT' }),
    ).rejects.toThrow(/não encontrado/i);
    expect(signedUrlMock).not.toHaveBeenCalled();
  });
});
