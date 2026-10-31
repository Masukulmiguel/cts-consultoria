export type ResourceKey = 'services' | 'courses' | 'news' | 'faqs' | 'enrollments' | 'materials';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'lines'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'relation';

export type RelationSource = 'users' | 'courses';

export type ResourceField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  full?: boolean;
  options?: { value: string; label: string }[];
  relation?: RelationSource;
};

export type ResourceColumn = {
  name: string;
  label: string;
};

export type ResourceDef = {
  key: ResourceKey;
  label: string;
  singular: string;
  model: 'service' | 'course' | 'newsPost' | 'faq' | 'enrollment' | 'material';
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
  enrollments: {
    key: 'enrollments',
    label: 'Inscrições',
    singular: 'inscrição',
    model: 'enrollment',
    titleField: 'userId',
    columns: [
      { name: 'userId', label: 'Formando' },
      { name: 'courseId', label: 'Curso' },
      { name: 'status', label: 'Estado' },
      { name: 'progress', label: 'Progresso' },
    ],
    fields: [
      {
        name: 'userId',
        label: 'Formando',
        type: 'relation',
        relation: 'users',
        required: true,
        full: true,
      },
      {
        name: 'courseId',
        label: 'Curso',
        type: 'relation',
        relation: 'courses',
        required: true,
        full: true,
      },
      {
        name: 'status',
        label: 'Estado',
        type: 'select',
        required: true,
        options: [
          { value: 'PENDING', label: 'Aguarda pagamento' },
          { value: 'PAID', label: 'Pago' },
          { value: 'CONFIRMED', label: 'Confirmada' },
          { value: 'COMPLETED', label: 'Concluída' },
          { value: 'CANCELLED', label: 'Cancelada' },
        ],
      },
      {
        name: 'progress',
        label: 'Progresso (%)',
        type: 'number',
        help: 'Percentagem concluída, entre 0 e 100.',
      },
      { name: 'notes', label: 'Notas internas', type: 'textarea', full: true },
    ],
  },
  materials: {
    key: 'materials',
    label: 'Materiais',
    singular: 'material',
    model: 'material',
    titleField: 'title',
    columns: [
      { name: 'title', label: 'Material' },
      { name: 'courseId', label: 'Curso' },
      { name: 'type', label: 'Tipo' },
      { name: 'published', label: 'Publicado' },
    ],
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, full: true },
      {
        name: 'courseId',
        label: 'Curso',
        type: 'relation',
        relation: 'courses',
        required: true,
        full: true,
      },
      {
        name: 'type',
        label: 'Tipo',
        type: 'select',
        options: [
          { value: 'document', label: 'Documento' },
          { value: 'slides', label: 'Apresentação' },
          { value: 'video', label: 'Vídeo' },
          { value: 'link', label: 'Ligação' },
        ],
      },
      { name: 'url', label: 'URL', type: 'text', required: true, full: true },
      { name: 'order', label: 'Ordem', type: 'number' },
      { name: 'published', label: 'Publicado', type: 'boolean' },
    ],
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);

export function isResourceKey(value: string): value is ResourceKey {
  return value in RESOURCES;
}
