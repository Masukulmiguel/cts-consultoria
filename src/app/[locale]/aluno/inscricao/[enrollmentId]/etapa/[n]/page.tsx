import { Step1 } from '@/components/enrollment/steps/step-1';
import { Step2 } from '@/components/enrollment/steps/step-2';
import { Step3 } from '@/components/enrollment/steps/step-3';
import { Step4 } from '@/components/enrollment/steps/step-4';
import { Step5 } from '@/components/enrollment/steps/step-5';
import { PROVINCES } from '@/content/angola-locations';
import type { Locale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { legacyStatusToNew } from '@/lib/enrollment-status-legacy';
import { loadWizardEnrollment, signedPreview } from '@/lib/enrollment-wizard/load-wizard-data';
import { getPaymentSettings } from '@/lib/payment-settings';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const ESTADOS_EDITAVEIS = new Set(['DRAFT', 'PENDING_DOCUMENTS', 'CORRECTION_REQUIRED']);

export default async function EnrollmentStepPage({
  params,
}: {
  params: Promise<{ locale: Locale; enrollmentId: string; n: string }>;
}) {
  const { locale, enrollmentId, n } = await params;
  setRequestLocale(locale);

  const passo = Number(n);
  if (!Number.isInteger(passo) || passo < 1 || passo > 5) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect(`/${locale}/aluno/login`);

  const enrollment = await loadWizardEnrollment(enrollmentId);
  if (!enrollment || enrollment.userId !== userId) notFound();

  const status = legacyStatusToNew(enrollment.status);
  if (!ESTADOS_EDITAVEIS.has(status)) redirect(`/${locale}/aluno`);
  if (status !== 'CORRECTION_REQUIRED' && enrollment.currentStep < passo) {
    redirect(`/${locale}/aluno/inscricao/${enrollmentId}/etapa/${enrollment.currentStep}`);
  }

  const actor = { userId: enrollment.userId, role: session.user.role };
  const perfil = enrollment.user.studentProfile;

  if (passo === 1) {
    return (
      <Step1
        enrollmentId={enrollment.id}
        provinciaInicial={
          PROVINCES.find((provincia) => provincia.name === perfil?.province)?.code ?? ''
        }
        valores={{
          primaryDocumentType: perfil?.nif ? 'NIF' : 'BI',
          nif: perfil?.nif ?? '',
          biNumber: perfil?.biNumber ?? '',
          fullName: enrollment.user.name ?? '',
          birthDate: perfil?.birthDate ? perfil.birthDate.toISOString().slice(0, 10) : '',
          address: perfil?.address ?? '',
          municipality: perfil?.municipality ?? '',
          province: perfil?.province ?? '',
          phone: perfil?.phone ?? '',
          email: enrollment.user.email ?? '',
        }}
      />
    );
  }

  if (passo === 2) {
    const frente = enrollment.documents.find((item) => item.kind === 'BI_FRONT');
    const verso = enrollment.documents.find((item) => item.kind === 'BI_BACK');
    const [urlFrente, urlVerso] = await Promise.all([
      frente ? signedPreview(frente.storageKey, actor) : Promise.resolve(null),
      verso ? signedPreview(verso.storageKey, actor) : Promise.resolve(null),
    ]);

    return (
      <Step2
        enrollmentId={enrollment.id}
        documentoFrente={frente ? { nome: frente.storageKey, previewUrl: urlFrente } : null}
        documentoVerso={verso ? { nome: verso.storageKey, previewUrl: urlVerso } : null}
      />
    );
  }

  if (passo === 3) {
    const fotografia = enrollment.documents.find((item) => item.kind === 'PHOTO');
    const preview = fotografia ? await signedPreview(fotografia.storageKey, actor) : null;

    return (
      <Step3
        enrollmentId={enrollment.id}
        documento={fotografia ? { nome: fotografia.storageKey, previewUrl: preview } : null}
      />
    );
  }

  if (passo === 4) {
    const comprovativo = enrollment.documents.find((item) => item.kind === 'PROOF');
    const [preview, pagamento] = await Promise.all([
      comprovativo ? signedPreview(comprovativo.storageKey, actor) : Promise.resolve(null),
      getPaymentSettings(),
    ]);
    const submissao = enrollment.paymentSubmission;

    return (
      <Step4
        enrollmentId={enrollment.id}
        curso={{
          titulo: enrollment.course.title,
          nivel: enrollment.course.level,
          preco: enrollment.course.price,
          resumo: enrollment.course.summary,
        }}
        pagamento={pagamento}
        documento={comprovativo ? { nome: comprovativo.storageKey, previewUrl: preview } : null}
        metodo={submissao?.method ?? 'EXPRESS'}
        valor={
          submissao
            ? Number(submissao.amount).toLocaleString('pt-PT')
            : (enrollment.course.price ?? '')
        }
        dataPagamento={new Date().toISOString().slice(0, 10)}
        referencia={submissao?.reference ?? ''}
      />
    );
  }

  const frente = enrollment.documents.some((item) => item.kind === 'BI_FRONT');
  const verso = enrollment.documents.some((item) => item.kind === 'BI_BACK');
  const fotografia = enrollment.documents.some((item) => item.kind === 'PHOTO');
  const comprovativo = enrollment.documents.some((item) => item.kind === 'PROOF');
  const submissao = enrollment.paymentSubmission;

  return (
    <Step5
      enrollmentId={enrollment.id}
      pessoais={{
        nome: enrollment.user.name ?? '',
        documento: perfil?.nif
          ? `NIF ${perfil.nif}`
          : perfil?.biNumber
            ? `BI ${perfil.biNumber}`
            : '',
        dataNascimento: perfil?.birthDate ? perfil.birthDate.toISOString().slice(0, 10) : '',
        morada: perfil?.address ?? '',
        municipio: perfil?.municipality ?? '',
        provincia: perfil?.province ?? '',
        telefone: perfil?.phone ?? '',
        email: enrollment.user.email ?? '',
      }}
      documentos={{ frente, verso, fotografia, comprovativo }}
      curso={{
        titulo: enrollment.course.title,
        nivel: enrollment.course.level,
        preco: enrollment.course.price,
      }}
      pagamento={{
        metodo:
          submissao?.method === 'BANK_TRANSFER'
            ? 'Transferência bancária'
            : submissao?.method === 'EXPRESS'
              ? 'Express'
              : '—',
        valor: submissao ? `${Number(submissao.amount).toLocaleString('pt-PT')} Kz` : '',
        referencia: submissao?.reference ?? null,
        data: null,
      }}
    />
  );
}
