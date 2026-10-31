'use server';

import {
  createRow,
  deleteRow,
  getRow,
  parseLines,
  slugify,
  updateRow,
} from '@/lib/admin/content-repo';
import type { ContentActionState } from '@/lib/admin/content-state';
import { RESOURCES, type ResourceKey, isResourceKey } from '@/lib/admin/resources';
import { audit } from '@/lib/audit';
import { requireRole } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CONTENT'] as const;
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const;

function buildPayload(
  key: ResourceKey,
  formData: FormData,
): { data: Record<string, unknown>; errors: Record<string, string> } {
  const def = RESOURCES[key];
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const field of def.fields) {
    if (field.type === 'boolean') {
      data[field.name] = formData.get(field.name) === 'on' || formData.get(field.name) === 'true';
      continue;
    }

    const raw = formData.get(field.name);
    const value = typeof raw === 'string' ? raw.trim() : '';

    if (field.required && !value) {
      errors[field.name] = `${field.label} é obrigatório.`;
      continue;
    }

    switch (field.type) {
      case 'number':
        data[field.name] = value === '' ? 0 : Number.parseInt(value, 10) || 0;
        break;
      case 'lines':
        data[field.name] = parseLines(value);
        break;
      case 'date':
        data[field.name] = value ? new Date(value) : new Date();
        break;
      default:
        data[field.name] = value === '' ? null : value;
    }
  }

  if (def.slugField && !data[def.slugField]) {
    const title = String(data[def.titleField] ?? '');
    if (title) data[def.slugField] = slugify(title);
  }

  return { data, errors };
}

function revalidatePublic() {
  revalidatePath('/[locale]', 'layout');
  revalidatePath('/[locale]/[section]', 'layout');
  revalidatePath('/[locale]/[section]/[slug]', 'layout');
}

export async function saveResource(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const resource = String(formData.get('resource') ?? '');
  const id = String(formData.get('id') ?? '');
  if (!isResourceKey(resource)) {
    return { status: 'error', message: 'Recurso desconhecido.' };
  }

  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole(...WRITE_ROLES);
  } catch {
    return { status: 'error', message: 'Sem permissão para editar conteúdos.' };
  }

  const { data, errors } = buildPayload(resource, formData);
  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Verifique os campos assinalados.', fieldErrors: errors };
  }

  try {
    if (id) {
      const existing = await getRow(resource, id);
      if (!existing) return { status: 'error', message: 'Registo não encontrado.' };
      await updateRow(resource, id, data);
      await audit({
        userId: user.id,
        action: 'content.update',
        entity: RESOURCES[resource].model,
        entityId: id,
        metadata: { fields: Object.keys(data) },
      });
    } else {
      const created = await createRow(resource, data);
      await audit({
        userId: user.id,
        action: 'content.create',
        entity: RESOURCES[resource].model,
        entityId: created.id,
        metadata: { fields: Object.keys(data) },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('Unique constraint')) {
      return {
        status: 'error',
        message: 'Já existe um registo com este slug. Escolha outro.',
      };
    }
    return { status: 'error', message: 'Não foi possível guardar. Tente novamente.' };
  }

  revalidatePublic();
  return { status: 'success', message: id ? 'Alterações guardadas.' : 'Registo criado.' };
}

export async function removeResource(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const resource = String(formData.get('resource') ?? '');
  const id = String(formData.get('id') ?? '');
  if (!isResourceKey(resource) || !id) {
    return { status: 'error', message: 'Registo inválido.' };
  }

  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole(...DELETE_ROLES);
  } catch {
    return { status: 'error', message: 'Sem permissão para eliminar conteúdos.' };
  }

  try {
    await deleteRow(resource, id);
    await audit({
      userId: user.id,
      action: 'content.delete',
      entity: RESOURCES[resource].model,
      entityId: id,
    });
  } catch {
    return { status: 'error', message: 'Não foi possível eliminar o registo.' };
  }

  revalidatePublic();
  return { status: 'success', message: 'Registo eliminado.' };
}
