export type ResourceKey = 'services' | 'courses' | 'news' | 'faqs';

export type FieldType = 'text' | 'textarea' | 'lines' | 'number' | 'boolean' | 'date';

export type ResourceField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  full?: boolean;
};

export type ResourceColumn = {
  name: string;
  label: string;
};

export type ResourceDef = {
  key: ResourceKey;
  label: string;
  singular: string;
  model: 'service' | 'course' | 'newsPost' | 'faq';
  titleField: string;
  slugField?: string;
  columns: ResourceColumn[];
  fields: ResourceField[];
};

export const RESOURCES: Record<ResourceKey, ResourceDef> = {
  services: {
    key: 'services',
    label: 'Serviços',
    singular: 'serviço',
    model: 'service',
    titleField: 'titlePt',
    slugField: 'slugPt',
    columns: [
      { name: 'titlePt', label: 'Título (PT)' },
      { name: 'categoryPt', label: 'Categoria' },
      { name: 'slugPt', label: 'Slug (PT)' },
      { name: 'published', label: 'Publicado' },
    ],
    fields: [
      { name: 'titlePt', label: 'Título (PT)', type: 'text', required: true, full: true },
      { name: 'titleEn', label: 'Título (EN)', type: 'text', full: true },
      { name: 'slugPt', label: 'Slug (PT)', type: 'text', required: true },
      { name: 'slugEn', label: 'Slug (EN)', type: 'text', required: true },
      { name: 'categoryPt', label: 'Categoria (PT)', type: 'text', required: true },
      { name: 'categoryEn', label: 'Categoria (EN)', type: 'text', required: true },
      {
        name: 'summaryPt',
        label: 'Resumo (PT)',
        type: 'textarea',
        required: true,
        full: true,
        help: 'Uma ou duas frases usadas nos cartões de serviço.',
      },
      {
        name: 'summaryEn',
        label: 'Resumo (EN)',
        type: 'textarea',
        full: true,
      },
      {
        name: 'bulletsPt',
        label: 'Inclui (PT)',
        type: 'lines',
        full: true,
        help: 'Uma linha por item incluído no serviço.',
      },
      {
        name: 'bulletsEn',
        label: 'Inclui (EN)',
        type: 'lines',
        full: true,
      },
      { name: 'order', label: 'Ordem', type: 'number' },
      { name: 'published', label: 'Publicado', type: 'boolean' },
    ],
  },
  courses: {
    key: 'courses',
    label: 'Cursos',
    singular: 'curso',
    model: 'course',
    titleField: 'title',
    slugField: 'slug',
    columns: [
      { name: 'title', label: 'Curso' },
      { name: 'family', label: 'Área' },
      { name: 'duration', label: 'Duração' },
      { name: 'published', label: 'Publicado' },
    ],
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, full: true },
      { name: 'titleEn', label: 'Título (EN)', type: 'text', full: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'family', label: 'Área', type: 'text', required: true },
      { name: 'level', label: 'Nível', type: 'text', placeholder: 'Júnior · Intermédio · Senior' },
      { name: 'duration', label: 'Duração', type: 'text', placeholder: '120 horas' },
      { name: 'price', label: 'Investimento', type: 'text', placeholder: 'A definir' },
      { name: 'summary', label: 'Resumo', type: 'textarea', required: true, full: true },
      { name: 'summaryEn', label: 'Resumo (EN)', type: 'textarea', full: true },
      { name: 'brochureUrl', label: 'Panfleto (URL)', type: 'text' },
      { name: 'imageUrl', label: 'Imagem (URL)', type: 'text' },
      { name: 'order', label: 'Ordem', type: 'number' },
      { name: 'published', label: 'Publicado', type: 'boolean' },
    ],
  },
  news: {
    key: 'news',
    label: 'Notícias',
    singular: 'notícia',
    model: 'newsPost',
    titleField: 'title',
    slugField: 'slug',
    columns: [
      { name: 'title', label: 'Título' },
      { name: 'category', label: 'Categoria' },
      { name: 'publishedAt', label: 'Data' },
      { name: 'published', label: 'Publicado' },
    ],
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, full: true },
      { name: 'titleEn', label: 'Título (EN)', type: 'text', full: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'category', label: 'Categoria', type: 'text', placeholder: 'Fiscalidade · Gestão' },
      { name: 'excerpt', label: 'Resumo', type: 'textarea', required: true, full: true },
      { name: 'excerptEn', label: 'Resumo (EN)', type: 'textarea', full: true },
      { name: 'body', label: 'Conteúdo', type: 'textarea', required: true, full: true },
      { name: 'bodyEn', label: 'Conteúdo (EN)', type: 'textarea', full: true },
      { name: 'imageUrl', label: 'Imagem (URL)', type: 'text' },
      { name: 'publishedAt', label: 'Data de publicação', type: 'date' },
      { name: 'published', label: 'Publicado', type: 'boolean' },
    ],
  },
  faqs: {
    key: 'faqs',
    label: 'FAQs',
    singular: 'pergunta',
    model: 'faq',
    titleField: 'question',
    columns: [
      { name: 'question', label: 'Pergunta' },
      { name: 'order', label: 'Ordem' },
      { name: 'published', label: 'Publicado' },
    ],
    fields: [
      { name: 'question', label: 'Pergunta', type: 'text', required: true, full: true },
      { name: 'questionEn', label: 'Pergunta (EN)', type: 'text', full: true },
      { name: 'answer', label: 'Resposta', type: 'textarea', required: true, full: true },
      { name: 'answerEn', label: 'Resposta (EN)', type: 'textarea', full: true },
      { name: 'order', label: 'Ordem', type: 'number' },
      { name: 'published', label: 'Publicado', type: 'boolean' },
    ],
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);

export function isResourceKey(value: string): value is ResourceKey {
  return value in RESOURCES;
}
