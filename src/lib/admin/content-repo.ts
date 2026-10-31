import type { ResourceKey } from '@/lib/admin/resources';
import { prisma } from '@/lib/prisma';

export type ResourceRow = Record<string, unknown> & { id: string };
export type ResourceData = Record<string, unknown>;

/** Converte um array de linhas do formulário num array de strings (uma por linha). */
export function parseLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Converte texto num slug seguro para URLs. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function listRows(key: ResourceKey): Promise<ResourceRow[]> {
  switch (key) {
    case 'services':
      return prisma.service.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }) as Promise<ResourceRow[]>;
    case 'courses':
      return prisma.course.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }) as Promise<ResourceRow[]>;
    case 'news':
      return prisma.newsPost.findMany({
        orderBy: [{ publishedAt: 'desc' }],
      }) as Promise<ResourceRow[]>;
    case 'faqs':
      return prisma.faq.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }) as Promise<ResourceRow[]>;
  }
}

export async function getRow(key: ResourceKey, id: string): Promise<ResourceRow | null> {
  switch (key) {
    case 'services':
      return (await prisma.service.findUnique({ where: { id } })) as ResourceRow | null;
    case 'courses':
      return (await prisma.course.findUnique({ where: { id } })) as ResourceRow | null;
    case 'news':
      return (await prisma.newsPost.findUnique({ where: { id } })) as ResourceRow | null;
    case 'faqs':
      return (await prisma.faq.findUnique({ where: { id } })) as ResourceRow | null;
  }
}

export async function createRow(key: ResourceKey, data: ResourceData): Promise<ResourceRow> {
  switch (key) {
    case 'services':
      return (await prisma.service.create({ data: data as never })) as ResourceRow;
    case 'courses':
      return (await prisma.course.create({ data: data as never })) as ResourceRow;
    case 'news':
      return (await prisma.newsPost.create({ data: data as never })) as ResourceRow;
    case 'faqs':
      return (await prisma.faq.create({ data: data as never })) as ResourceRow;
  }
}

export async function updateRow(
  key: ResourceKey,
  id: string,
  data: ResourceData,
): Promise<ResourceRow> {
  switch (key) {
    case 'services':
      return (await prisma.service.update({ where: { id }, data: data as never })) as ResourceRow;
    case 'courses':
      return (await prisma.course.update({ where: { id }, data: data as never })) as ResourceRow;
    case 'news':
      return (await prisma.newsPost.update({ where: { id }, data: data as never })) as ResourceRow;
    case 'faqs':
      return (await prisma.faq.update({ where: { id }, data: data as never })) as ResourceRow;
  }
}

export async function deleteRow(key: ResourceKey, id: string): Promise<void> {
  switch (key) {
    case 'services':
      await prisma.service.delete({ where: { id } });
      return;
    case 'courses':
      await prisma.course.delete({ where: { id } });
      return;
    case 'news':
      await prisma.newsPost.delete({ where: { id } });
      return;
    case 'faqs':
      await prisma.faq.delete({ where: { id } });
  }
}
