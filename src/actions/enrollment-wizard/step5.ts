'use server';

import { REQUIRED_DOCUMENT_KINDS, transitionEnrollment } from '@/lib/enrollment-state';
import { type WizardActionResult, currentActor, loadOwnedEnrollment } from './common';

const ROTULOS: Record<(typeof REQUIRED_DOCUMENT_KINDS)[number], string> = {
  BI_FRONT: 'frente do Bilhete de Identidade',
  BI_BACK: 'verso do Bilhete de Identidade',
  PHOTO: 'fotografia',
  PROOF: 'comprovativo de pagamento',
};

export async function submitEnrollment(
  enrollmentId: string,
  _prev: WizardActionResult | null,
  formData: FormData,
): Promise<WizardActionResult> {
  const enrollment = await loadOwnedEnrollment(enrollmentId);

  if (String(formData.get('termsAccepted') ?? '') !== 'on') {
    return {
      ok: false,
      errors: { terms: 'Tem de aceitar as condições para submeter a inscrição.' },
    };
  }

  const tipos = new Set(enrollment.documents.map((document) => document.kind));
  const emFalta = REQUIRED_DOCUMENT_KINDS.filter((kind) => !tipos.has(kind));
  if (emFalta.length > 0) {
    return {
      ok: false,
      message: `Faltam os seguintes documentos: ${emFalta
        .map((kind) => ROTULOS[kind])
        .join(', ')}.`,
    };
  }

  const actor = await currentActor();
  const transicao = await transitionEnrollment({
    enrollmentId,
    to: 'SUBMITTED',
    actor,
    reason: 'Submissão da inscrição pelo formando',
  });

  if (!transicao.ok) {
    return { ok: false, message: transicao.message };
  }

  return {
    ok: true,
    nextStep: 5,
    message: 'Inscrição submetida. A validação é feita pela secretaria.',
  };
}
