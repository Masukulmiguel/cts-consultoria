import { EnrollmentReviewPanel } from '@/components/admin/enrollment-review-panel';
import { ResourceForm } from '@/components/admin/resource-form';
import type { Locale } from '@/i18n/routing';
import { getRow, relationOptions } from '@/lib/admin/content-repo';
import { RESOURCES, isResourceKey } from '@/lib/admin/resources';
import { compareIdentity } from '@/lib/ocr/compare';
import { prisma } from '@/lib/prisma';
import { AuthError, requireRole } from '@/lib/rbac';
import { createEnrollmentDocumentUrl } from '@/lib/storage/enrollment-documents';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

const ROTULOS_DOCUMENTO: Record<string, string> = {
  BI_FRONT: 'Frente do Bilhete de Identidade',
  BI_BACK: 'Verso do Bilhete de Identidade',
  PHOTO: 'Fotografia do formando',
  PROOF: 'Comprovativo de pagamento',
};

type OcrGuardado = {
  raw?: string;
  extracted?: { fullName?: string; biNumber?: string; birthDate?: string };
};

function lerOcr(valor: unknown): OcrGuardado | null {
  if (!valor || typeof valor !== 'object') return null;
  const dados = valor as OcrGuardado;
  return typeof dados.raw === 'string' ? dados : null;
}

export default async function ResourceEditPage({
  params,
}: {
  params: Promise<{ locale: Locale; resource: string; id: string }>;
}) {
  const { locale, resource, id } = await params;
  if (!isResourceKey(resource)) notFound();
  const def = RESOURCES[resource];

  if (resource === 'enrollments') {
    let revisor: Awaited<ReturnType<typeof requireRole>>;
    try {
      revisor = await requireRole('SUPER_ADMIN', 'ADMIN', 'SUPPORT');
    } catch (error) {
      if (error instanceof AuthError) redirect('/pt/admin');
      throw error;
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        user: { include: { studentProfile: true } },
        course: true,
        documents: true,
        paymentSubmission: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!enrollment) notFound();

    const perfil = enrollment.user.studentProfile;
    const registados = {
      fullName: enrollment.user.name ?? '',
      biNumber: perfil?.biNumber ?? '',
      birthDate: perfil?.birthDate ? perfil.birthDate.toISOString().slice(0, 10) : '',
    };

    const documentos = await Promise.all(
      enrollment.documents.map(async (documento) => {
        let previewUrl: string | null = null;
        try {
          previewUrl = await createEnrollmentDocumentUrl(documento.storageKey, {
            userId: revisor.id,
            role: revisor.role,
          });
        } catch {
          previewUrl = null;
        }

        const ocr = lerOcr(documento.ocrRaw);
        const comparacao = ocr?.extracted
          ? compareIdentity(registados, {
              fullName: ocr.extracted.fullName ?? '',
              biNumber: ocr.extracted.biNumber ?? '',
              birthDate: ocr.extracted.birthDate ?? '',
            })
          : [];

        return {
          id: documento.id,
          kind: documento.kind,
          rotulo: ROTULOS_DOCUMENTO[documento.kind] ?? documento.kind,
          reviewStatus: documento.reviewStatus,
          previewUrl,
          ocrStatus: documento.ocrStatus,
          ocrConfidence: documento.ocrConfidence,
          ocrTexto: ocr?.raw ?? null,
          comparacao,
          rejectionReason: documento.rejectionReason,
        };
      }),
    );

    const revisores = await prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });

    const submissao = enrollment.paymentSubmission;

    return (
      <div className="space-y-6">
        <header>
          <Link
            href={`/${locale}/admin/${resource}`}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
          >
            {def.label}
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-white">Validar inscrição</h1>
          <p className="mt-1 text-sm text-white/60">
            {enrollment.user.name ?? enrollment.user.email} · {enrollment.course.title} ·{' '}
            {enrollment.status}
          </p>
        </header>

        <EnrollmentReviewPanel
          painel={{
            enrollmentId: enrollment.id,
            status: enrollment.status,
            role: revisor.role,
            pessoais: {
              nome: enrollment.user.name ?? '',
              nif: perfil?.nif ?? '',
              biNumber: perfil?.biNumber ?? '',
              dataNascimento: perfil?.birthDate ? perfil.birthDate.toISOString().slice(0, 10) : '',
              morada: perfil?.address ?? '',
              municipio: perfil?.municipality ?? '',
              provincia: perfil?.province ?? '',
              telefone: perfil?.phone ?? '',
              email: enrollment.user.email,
            },
            documentos,
            pagamento: submissao
              ? {
                  metodo:
                    submissao.method === 'BANK_TRANSFER'
                      ? 'Transferência bancária'
                      : 'Multicaixa Express',
                  valor: `${Number(submissao.amount).toLocaleString('pt-PT')} Kz`,
                  referencia: submissao.reference ?? '',
                  data: submissao.createdAt.toISOString().slice(0, 10),
                  reviewStatus: submissao.reviewStatus,
                  rejectionReason: submissao.rejectionReason,
                  ocrExtract: submissao.ocrExtract
                    ? JSON.stringify(submissao.ocrExtract, null, 2)
                    : null,
                }
              : null,
            curso: {
              titulo: enrollment.course.title,
              nivel: enrollment.course.level ?? '',
              familia: enrollment.course.family,
              duracao: enrollment.course.duration ?? '',
              preco: enrollment.course.price ?? '',
              resumo: enrollment.course.summary,
            },
            historico: enrollment.statusHistory.map((registo) => ({
              fromStatus: registo.fromStatus,
              toStatus: registo.toStatus,
              actorRole: registo.actorRole,
              reason: registo.reason,
              createdAt: registo.createdAt.toISOString(),
            })),
            revisores: revisores.map((user) => ({
              id: user.id,
              nome: user.name ?? user.email,
            })),
          }}
        />
      </div>
    );
  }

  const record = await getRow(resource, id);
  if (!record) notFound();

  const sources = [...new Set(def.fields.map((field) => field.relation).filter(Boolean))] as (
    | 'users'
    | 'courses'
  )[];
  const options = Object.fromEntries(
    await Promise.all(
      sources.map(async (source) => [source, await relationOptions(source)] as const),
    ),
  );

  return (
    <div className="space-y-6">
      <header>
        <Link
          href={`/${locale}/admin/${resource}`}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
        >
          {def.label}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">Editar {def.singular}</h1>
      </header>

      <ResourceForm resource={def} record={record} locale={locale} relationOptions={options} />
    </div>
  );
}
