'use server';

import { step1Schema } from '@/lib/enrollment-wizard/schemas';
import { prisma } from '@/lib/prisma';
import {
  type WizardActionResult,
  applyCorrectionIfNeeded,
  currentActor,
  loadOwnedEnrollment,
} from './common';

export async function saveStep1(
  enrollmentId: string,
  _prev: WizardActionResult | null,
  formData: FormData,
): Promise<WizardActionResult> {
  const enrollment = await loadOwnedEnrollment(enrollmentId);

  const parsed = step1Schema.safeParse({
    primaryDocumentType: formData.get('primaryDocumentType'),
    nif: formData.get('nif') ?? undefined,
    biNumber: formData.get('biNumber') ?? undefined,
    fullName: formData.get('fullName'),
    birthDate: formData.get('birthDate'),
    address: formData.get('address'),
    municipality: formData.get('municipality'),
    province: formData.get('province'),
    phone: formData.get('phone'),
    email: formData.get('email'),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? 'formulario');
      errors[field] ??= issue.message;
    }
    return { ok: false, errors };
  }

  const data = parsed.data;
  const profile = {
    nif: data.nif || null,
    biNumber: data.biNumber || null,
    birthDate: new Date(data.birthDate),
    address: data.address,
    municipality: data.municipality,
    province: data.province,
    phone: data.phone,
    primaryDocumentType: data.primaryDocumentType,
  };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: enrollment.userId },
        data: { name: data.fullName, email: data.email },
      });
      await tx.studentProfile.upsert({
        where: { userId: enrollment.userId },
        create: { userId: enrollment.userId, ...profile },
        update: profile,
      });
      await tx.enrollment.update({
        where: { id: enrollmentId },
        data: { currentStep: 2 },
      });
    });
  } catch (error) {
    const codigo = (error as { code?: string } | null)?.code;
    if (codigo === 'P2002') {
      return { ok: false, errors: { email: 'Esse e-mail já está associado a outra conta.' } };
    }
    return { ok: false, message: 'Não foi possível guardar os dados. Tente novamente.' };
  }

  const actor = await currentActor();
  await applyCorrectionIfNeeded(enrollment, actor);

  return { ok: true, nextStep: 2 };
}
