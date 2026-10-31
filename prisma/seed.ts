import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed de arranque: cria o superadministrador a partir das variáveis de ambiente.
 * Nunca usa credenciais fixas no código (regra do projecto).
 * Em produção, definir BOOTSTRAP_ADMIN_* apenas na primeira instalação e remover.
 */
async function main() {
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
