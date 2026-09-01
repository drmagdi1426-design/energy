/**
 * Create or reset the admin account directly in the database.
 *
 * Usage:
 *   npm run admin:create -- --username admin --password 'a-strong-passphrase'
 *   npm run admin:create                 (interactive prompts)
 *
 * The password is hashed with bcrypt (cost 12) before it touches the
 * database — the plaintext is never stored or logged. Run this from a
 * trusted terminal; scroll back / clear your shell history afterwards if
 * you passed the password as a CLI flag.
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { hashPassword } from '../src/lib/auth';
import { prisma } from '../src/lib/prisma';

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  let username = argValue('--username');
  let password = argValue('--password');

  if (!username || !password) {
    const rl = createInterface({ input: stdin, output: stdout });
    username ??= (await rl.question('Admin username: ')).trim();
    password ??= (await rl.question('Admin password (min 12 chars): ')).trim();
    rl.close();
  }

  if (!username) throw new Error('Username is required.');
  if (!password || password.length < 12) {
    throw new Error('Password must be at least 12 characters.');
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`Admin account "${user.username}" created/updated successfully.`);
  console.log('You can also store this hash as ADMIN_PASSWORD_HASH for `npm run db:seed`:');
  console.log(passwordHash);
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
