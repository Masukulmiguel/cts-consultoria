import { type Localized, services as staticServices } from '@/content/services';
import { prisma } from '@/lib/prisma';

export type PublicService = {
  id: string;
  slug: { pt: string; en: string };
  title: Localized;
  category: Localized;
  summary: Localized;
  bullets: Localized[];
  order: number;
};

/**
 * Serviços publicados, lidos da base de dados.
 * Se a base de dados estiver indisponível ou vazia, devolve o conteúdo estático
 * para o site nunca ficar sem informação.
 */
export async function getPublicServices(): Promise<PublicService[]> {
  const fallback = (): PublicService[] =>
    staticServices.map((service, index) => ({
      id: `static-${index}`,
      slug: service.slug,
      title: service.title,
      category: service.category,
      summary: service.summary,
      bullets: service.bullets,
      order: index,
    }));

  try {
    const rows = await prisma.service.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    if (rows.length === 0) return fallback();

    return rows.map((row) => ({
      id: row.id,
      slug: { pt: row.slugPt, en: row.slugEn },
      title: { pt: row.titlePt, en: row.titleEn },
      category: { pt: row.categoryPt, en: row.categoryEn },
      summary: { pt: row.summaryPt, en: row.summaryEn },
      bullets: row.bulletsPt.map((text, index) => ({
        pt: text,
        en: row.bulletsEn[index] ?? '',
      })),
      order: row.order,
    }));
  } catch {
    return fallback();
  }
}

export type PublicCourse = {
  id: string;
  slug: string;
  title: Localized;
  family: string;
  summary: Localized;
  level: string | null;
  duration: string | null;
  price: string | null;
  imageUrl: string | null;
};

export async function getPublicCourses(): Promise<PublicCourse[]> {
  try {
    const rows = await prisma.course.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: { pt: row.title, en: row.titleEn ?? row.title },
      family: row.family,
      summary: { pt: row.summary, en: row.summaryEn ?? row.summary },
      level: row.level,
      duration: row.duration,
      price: row.price,
      imageUrl: row.imageUrl,
    }));
  } catch {
    return [];
  }
}

export type PublicNewsPost = {
  id: string;
  slug: string;
  title: Localized;
  excerpt: Localized;
  body: Localized;
  category: string | null;
  imageUrl: string | null;
  publishedAt: Date;
};

export async function getPublicNews(): Promise<PublicNewsPost[]> {
  try {
    const rows = await prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: { pt: row.title, en: row.titleEn ?? row.title },
      excerpt: { pt: row.excerpt, en: row.excerptEn ?? row.excerpt },
      body: { pt: row.body, en: row.bodyEn ?? row.body },
      category: row.category,
      imageUrl: row.imageUrl,
      publishedAt: row.publishedAt,
    }));
  } catch {
    return [];
  }
}

export type PublicFaq = {
  id: string;
  question: Localized;
  answer: Localized;
  order: number;
};

export async function getPublicFaqs(): Promise<PublicFaq[]> {
  try {
    const rows = await prisma.faq.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return rows.map((row) => ({
      id: row.id,
      question: { pt: row.question, en: row.questionEn ?? row.question },
      answer: { pt: row.answer, en: row.answerEn ?? row.answer },
      order: row.order,
    }));
  } catch {
    return [];
  }
}
