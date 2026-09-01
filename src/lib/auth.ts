import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Admin authentication + brute-force lockout. A single shared admin
// credential is acceptable for v1 per the build spec; the password itself is
// never stored, only its bcrypt hash (AdminUser.passwordHash).

const LOCKOUT_WINDOW_MINUTES = 15;
const MAX_FAILURES_IN_WINDOW = 5;

// A precomputed bcrypt hash of a random value, compared against on a
// nonexistent-username login attempt so the response time doesn't leak
// whether the username exists.
const DUMMY_HASH = '$2b$12$UFuNm/ZQrzdRj26tQbjVpOD4XjeIboNB998JOLwpl.82mwq4AIngS';

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(password, user.passwordHash);
}

export async function isLockedOut(username: string): Promise<boolean> {
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000);
  const failures = await prisma.loginAttempt.count({
    where: { username, success: false, createdAt: { gte: since } },
  });
  return failures >= MAX_FAILURES_IN_WINDOW;
}

export async function recordLoginAttempt(username: string, ipAddress: string, success: boolean): Promise<void> {
  await prisma.loginAttempt.create({ data: { username, ipAddress, success } });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
