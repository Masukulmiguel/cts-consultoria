import { z } from 'zod';

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const data = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(data.getTime())) return false;
  return data.toISOString().slice(0, 10) === value;
}

const isoDate = (campo: string) =>
  z
    .string({ required_error: `A ${campo} é obrigatória.` })
    .trim()
    .min(1, `A ${campo} é obrigatória.`)
    .refine(isIsoDate, `A ${campo} deve estar no formato aaaa-mm-dd.`);

export const step1Schema = z
  .object({
    primaryDocumentType: z.enum(['NIF', 'BI'], {
      errorMap: () => ({ message: 'Escolha o tipo de documento de identificação.' }),
    }),
    nif: z
      .string()
      .trim()
      .regex(/^\d{9,10}$/, 'O NIF deve ter 9 ou 10 dígitos.')
      .optional()
      .or(z.literal('')),
    biNumber: z
      .string()
      .trim()
      .min(6, 'O número do Bilhete de Identidade deve ter pelo menos 6 caracteres.')
      .max(20, 'O número do Bilhete de Identidade deve ter no máximo 20 caracteres.')
      .optional()
      .or(z.literal('')),
    fullName: z
      .string()
      .trim()
      .min(2, 'Indique o seu nome completo.')
      .max(120, 'O nome completo deve ter no máximo 120 caracteres.'),
    birthDate: isoDate('data de nascimento'),
    address: z
      .string()
      .trim()
      .min(3, 'Indique a sua morada.')
      .max(240, 'A morada deve ter no máximo 240 caracteres.'),
    municipality: z
      .string()
      .trim()
      .min(2, 'Indique o seu município.')
      .max(120, 'O município deve ter no máximo 120 caracteres.'),
    province: z
      .string()
      .trim()
      .min(2, 'Indique a sua província.')
      .max(120, 'A província deve ter no máximo 120 caracteres.'),
    phone: z
      .string()
      .trim()
      .regex(/^\+?\d{9,15}$/, 'Indique um telefone válido com 9 a 15 dígitos.'),
    email: z
      .string()
      .trim()
      .email('Indique um e-mail válido.')
      .max(190, 'O e-mail deve ter no máximo 190 caracteres.'),
  })
  .superRefine((dados, ctx) => {
    if (dados.primaryDocumentType === 'NIF' && !dados.nif) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nif'],
        message: 'Indique o seu NIF.',
      });
    }
    if (dados.primaryDocumentType === 'BI' && !dados.biNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['biNumber'],
        message: 'Indique o número do seu Bilhete de Identidade.',
      });
    }
  });

export const step4Schema = z.object({
  method: z.enum(['EXPRESS', 'BANK_TRANSFER'], {
    errorMap: () => ({ message: 'Escolha o método de pagamento.' }),
  }),
  amount: z
    .number({ invalid_type_error: 'Indique o valor pago.' })
    .positive('O valor pago deve ser maior do que zero.'),
  reference: z
    .string()
    .trim()
    .max(120, 'A referência deve ter no máximo 120 caracteres.')
    .optional(),
  paymentDate: isoDate('data do pagamento'),
  ocrValue: z.string().trim().optional(),
  ocrReference: z.string().trim().optional(),
});

export type Step1Input = z.infer<typeof step1Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
