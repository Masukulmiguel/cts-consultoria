import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    course: { findMany: vi.fn() },
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

import { getPublicCourses } from './content-db';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getPublicCourses', () => {
  it('devolve o panfleto, a descrição e o preço de cada curso publicado', async () => {
    prismaMock.course.findMany.mockResolvedValue([
      {
        id: 'c1',
        slug: 'cts-academia-junior-1',
        title: 'Contabilidade e Fiscalidade',
        titleEn: 'Accounting and Tax',
        family: 'Contabilidade',
        summary: 'Curso prático com certificados INEFOP.',
        summaryEn: 'Practical course with INEFOP certificates.',
        level: 'Júnior',
        duration: '120 horas',
        price: '150.000 Kz',
        brochureUrl: '/training/flyer-1.jpg',
        imageUrl: '/training/flyer-1.jpg',
        order: 0,
        published: true,
      },
    ]);

    const courses = await getPublicCourses();

    expect(courses).toHaveLength(1);
    expect(courses[0].brochureUrl).toBe('/training/flyer-1.jpg');
    expect(courses[0].summary.pt).toBe('Curso prático com certificados INEFOP.');
    expect(courses[0].price).toBe('150.000 Kz');
  });

  it('devolve lista vazia quando a base de dados falha', async () => {
    prismaMock.course.findMany.mockRejectedValue(new Error('bd indisponível'));

    await expect(getPublicCourses()).resolves.toEqual([]);
  });
});
