import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { services, trainingFamilies } from '../src/content/services';

const prisma = new PrismaClient();

/**
 * Seed de arranque: cria o superadministrador a partir das variáveis de ambiente.
 * Nunca usa credenciais fixas no código (regra do projecto).
 * Em produção, definir BOOTSTRAP_ADMIN_* apenas na primeira instalação e remover.
 */
async function seedAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const name = process.env.BOOTSTRAP_ADMIN_NAME ?? 'Superadministrador';

  if (!email || !password) {
    console.log('[seed] BOOTSTRAP_ADMIN_EMAIL/PASSWORD não definidos — seed ignorado.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'SUPER_ADMIN', name, passwordHash },
    create: {
      email,
      name,
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`[seed] Superadministrador pronto: ${user.email}`);
}

/** Migra os serviços reais do website para a base de dados (CRUD no admin). */
async function seedServices() {
  for (const [index, service] of services.entries()) {
    const data = {
      slugPt: service.slug.pt,
      slugEn: service.slug.en,
      titlePt: service.title.pt,
      titleEn: service.title.en,
      categoryPt: service.category.pt,
      categoryEn: service.category.en,
      summaryPt: service.summary.pt,
      summaryEn: service.summary.en,
      bulletsPt: service.bullets.map((bullet) => bullet.pt),
      bulletsEn: service.bullets.map((bullet) => bullet.en),
      order: index,
      published: true,
    };

    await prisma.service.upsert({
      where: { slugPt: service.slug.pt },
      update: data,
      create: data,
    });
  }
  console.log(`[seed] ${services.length} serviços sincronizados.`);
}

/** Cria os cursos a partir das famílias de formação e dos panfletos reais. */
async function seedCourses() {
  const flyers = [
    { file: 'flyer-1.jpg', family: 0, level: 'Júnior' },
    { file: 'flyer-2.jpg', family: 0, level: 'Intermédio' },
    { file: 'flyer-3.jpg', family: 0, level: 'Sénior' },
    { file: 'flyer-4.jpg', family: 0, level: 'Primavera v10' },
    { file: 'flyer-5.jpg', family: 0, level: 'Portal AGT' },
    { file: 'flyer-6.jpg', family: 0, level: 'Contabilidade' },
    { file: 'flyer-7.jpg', family: 1, level: 'Recursos Humanos' },
    { file: 'flyer-8.jpg', family: 1, level: 'Recursos Humanos + Primavera' },
    { file: 'flyer-9.jpg', family: 2, level: 'Fecho de Contas' },
    { file: 'flyer-10.jpg', family: 2, level: 'Fecho de Contas' },
    { file: 'flyer-11.jpg', family: 2, level: 'Fecho de Contas' },
  ];

  for (const [index, flyer] of flyers.entries()) {
    const family = trainingFamilies[flyer.family];
    const slug = `cts-academia-${flyer.level.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`;
    const data = {
      slug,
      title: `${family.title.pt} — ${flyer.level}`,
      titleEn: `${family.title.en} — ${flyer.level}`,
      family: family.title.pt,
      summary: family.description.pt,
      summaryEn: family.description.en,
      level: flyer.level,
      brochureUrl: `/training/${flyer.file}`,
      imageUrl: `/training/${flyer.file}`,
      order: index,
      published: true,
    };

    await prisma.course.upsert({
      where: { slug },
      update: data,
      create: data,
    });
  }
  console.log(`[seed] ${flyers.length} cursos sincronizados.`);
}

/** Perguntas frequentes reais sobre os serviços da CTS. */
async function seedFaqs() {
  const faqs = [
    {
      question: 'A CTS emite facturas conforme a legislação angolana?',
      questionEn: 'Does CTS issue invoices in line with Angolan legislation?',
      answer:
        'Sim. Todos os documentos são emitidos de acordo com a Lei n.º 5/19 sobre o IVA, o regime tributário em vigor e as regras da AGT, com numeração sequencial e ficheiro SAF-T para controle.',
      answerEn:
        'Yes. All documents follow Law No. 5/19 on VAT, AGT rules and sequential numbering, with SAF-T files for control.',
      order: 1,
    },
    {
      question: 'Quanto tempo demora a implementação do Primavera v10?',
      questionEn: 'How long does the Primavera v10 implementation take?',
      answer:
        'Um projecto típico decorre entre seis e doze semanas, conforme o número de módulos, o histórico de dados e o número de utilizadores a formar.',
      answerEn:
        'A typical project runs between six and twelve weeks, depending on modules, data history and the number of users to train.',
      order: 2,
    },
    {
      question: 'Os certificados de formação são reconhecidos?',
      questionEn: 'Are the training certificates recognised?',
      answer:
        'Sim. As formações da CTS Academia são homologadas pelo INEFOP e os certificados emitidos permitem a prossecução de estágios profissionais.',
      answerEn:
        'Yes. CTS Academy programmes are INEFOP-homologated and the certificates issued allow professional internships.',
      order: 3,
    },
    {
      question: 'A CTS presta serviço a empresas fora de Luanda?',
      questionEn: 'Does CTS serve companies outside Luanda?',
      answer:
        'Sim. Trabalhamos com clientes em todo o país, de forma remota, e com deslocações pontuais quando o projecto o exige.',
      answerEn:
        'Yes. We work with clients nationwide remotely, with on-site visits whenever the project requires them.',
      order: 4,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (existing) {
      await prisma.faq.update({ where: { id: existing.id }, data: faq });
    } else {
      await prisma.faq.create({ data: faq });
    }
  }
  console.log(`[seed] ${faqs.length} perguntas frequentes sincronizadas.`);
}

async function main() {
  await seedAdmin();
  await seedServices();
  await seedCourses();
  await seedFaqs();
  await seedStudent();
}

/** Formando de demonstração com inscrição, materiais e certificado. */
async function seedStudent() {
  const email = process.env.SEED_STUDENT_EMAIL;
  const password = process.env.SEED_STUDENT_PASSWORD;

  if (!email || !password) {
    console.log('[seed] SEED_STUDENT_EMAIL/PASSWORD não definidos — formando ignorado.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const student = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'STUDENT' },
    create: {
      email,
      name: 'Formando de Demonstração',
      passwordHash,
      role: 'STUDENT',
    },
  });

  const course = await prisma.course.findFirst({ orderBy: { order: 'asc' } });
  if (!course) return;

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: { status: 'CONFIRMED', progress: 65 },
    create: {
      userId: student.id,
      courseId: course.id,
      status: 'CONFIRMED',
      progress: 65,
    },
  });

  await prisma.material.upsert({
    where: { id: 'seed-material-1' },
    update: {},
    create: {
      id: 'seed-material-1',
      courseId: course.id,
      title: 'Plano de formação — módulo introdutório',
      type: 'document',
      url: '/training/flyer-1.jpg',
      order: 1,
      published: true,
    },
  });

  await prisma.material.upsert({
    where: { id: 'seed-material-2' },
    update: {},
    create: {
      id: 'seed-material-2',
      courseId: course.id,
      title: 'Aula inaugural em vídeo',
      type: 'video',
      url: '/training/flyer-2.jpg',
      order: 2,
      published: true,
    },
  });

  const attendanceCount = await prisma.attendance.count({
    where: { enrollmentId: enrollment.id },
  });
  if (attendanceCount === 0) {
    await prisma.attendance.createMany({
      data: [1, 2, 3].map((session) => ({
        enrollmentId: enrollment.id,
        session: `Sessão ${session}`,
        date: new Date(2026, 9, session + 1),
        present: session !== 3,
      })),
    });
  }

  const certificate = await prisma.certificate.findUnique({
    where: { code: 'CTS-2026-0001' },
  });
  if (!certificate) {
    await prisma.certificate.create({
      data: {
        enrollmentId: enrollment.id,
        code: 'CTS-2026-0001',
        issuedAt: new Date(2026, 8, 30),
      },
    });
  }

  console.log(`[seed] Formando de demonstração pronto: ${student.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
