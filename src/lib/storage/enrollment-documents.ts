import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { AuthError } from '@/lib/rbac';
import type { UserRole } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

import { sniffMimeType } from './magic-bytes';

export type DocKind = 'BI_FRONT' | 'BI_BACK' | 'PHOTO' | 'PROOF';

export const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

export const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const;

type ActorLike = { userId: string; role: UserRole };

function storageClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      'Storage não configurado: faltam as variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function bucketName(): string {
  return process.env.SUPABASE_ENROLLMENT_BUCKET || 'enrollment-documents';
}

/** Chave do objecto no bucket: dono/inscrição/tipo. Sem nome, NIF ou BI. */
export function storageKeyFor(userId: string, enrollmentId: string, kind: DocKind): string {
  return `${userId}/${enrollmentId}/${kind}`;
}

/**
 * Só o dono, ou ADMIN/SUPER_ADMIN/SUPPORT, pode aceder ao documento.
 * Lança `AuthError('FORBIDDEN')` caso contrário.
 */
export function assertOwnedDocument(enrollment: { userId: string }, actor: ActorLike): void {
  if (actor.userId === enrollment.userId) return;
  if (actor.role === 'SUPER_ADMIN' || actor.role === 'ADMIN' || actor.role === 'SUPPORT') return;
  throw new AuthError('FORBIDDEN', 'Sem permissão para aceder a este documento.');
}

export async function uploadEnrollmentDocument(input: {
  enrollmentId: string;
  userId: string;
  kind: DocKind;
  bytes: Uint8Array;
  declaredType: string;
}): Promise<{ storageKey: string; mimeType: string; byteSize: number; sha256: string }> {
  const { enrollmentId, userId, kind, bytes, declaredType } = input;

  if (bytes.byteLength > MAX_DOCUMENT_BYTES) {
    throw new Error('O ficheiro excede o limite de 8 MB.');
  }

  const sniffed = sniffMimeType(bytes);
  if (!sniffed) {
    throw new Error('O ficheiro tem de ser uma imagem (JPEG ou PNG) ou um PDF.');
  }

  const declared = declaredType.trim().toLowerCase();
  const mimeType = (SUPPORTED_MIME_TYPES as readonly string[]).includes(declared)
    ? declared
    : sniffed;
  if (mimeType !== sniffed) {
    throw new Error('O conteúdo do ficheiro não corresponde ao tipo declarado.');
  }

  const storageKey = storageKeyFor(userId, enrollmentId, kind);
  const sha256 = createHash('sha256').update(bytes).digest('hex');

  const { error } = await storageClient()
    .storage.from(bucketName())
    .upload(storageKey, new Blob([new Uint8Array(bytes)], { type: mimeType }), {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Falha ao guardar o documento: ${error.message}`);
  }

  return { storageKey, mimeType, byteSize: bytes.byteLength, sha256 };
}

export async function createEnrollmentDocumentUrl(
  storageKey: string,
  actor: ActorLike,
): Promise<string> {
  const document = await prisma.enrollmentDocument.findUnique({
    where: { storageKey },
    select: { id: true, enrollment: { select: { userId: true } } },
  });

  if (!document) {
    throw new Error('Documento não encontrado.');
  }

  assertOwnedDocument({ userId: document.enrollment.userId }, actor);

  const { data, error } = await storageClient()
    .storage.from(bucketName())
    .createSignedUrl(storageKey, 600);

  if (error || !data?.signedUrl) {
    throw new Error(`Falha ao criar o URL assinado: ${error?.message ?? 'erro desconhecido'}.`);
  }

  return data.signedUrl;
}
