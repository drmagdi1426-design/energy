/**
 * Idempotent seed: ensures the admin user configured via env vars exists.
 * Does NOT create any sample response data — this is a real HR diagnostic
 * tool and a seed script is not the place to fabricate fake employee data.
 *
 * Usage: npm run db:seed
 * Requires ADMIN_USERNAME and ADMIN_PASSWORD_HASH to be set (see
 * scripts/create-admin.ts for the recommended way to generate the hash).
 */
import { prisma } from '../src/lib/prisma';

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!username || !passwordHash) {
    console.log(
      'ADMIN_USERNAME / ADMIN_PASSWORD_HASH not set — skipping admin seed. Run `npm run admin:create` instead to create/reset the admin account directly.',
    );
    return;
  }

  await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`Admin user "${username}" is ready.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
