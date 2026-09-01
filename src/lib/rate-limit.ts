import { prisma } from '@/lib/prisma';

// DB-backed rate limiting so no extra infrastructure (Redis, etc.) is
// required for a single-repo deployment. Coarse but effective against
// scripted spam on the public questionnaire endpoint.

const SUBMISSION_WINDOW_MINUTES = 60;
const SUBMISSION_MAX_PER_WINDOW = 20; // per IP — generous for a shared office/VPN egress IP

export async function checkAndRecordSubmissionRateLimit(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - SUBMISSION_WINDOW_MINUTES * 60 * 1000);
  const count = await prisma.submissionRateLimit.count({
    where: { ipAddress: ip, createdAt: { gte: since } },
  });
  if (count >= SUBMISSION_MAX_PER_WINDOW) return false;
  await prisma.submissionRateLimit.create({ data: { ipAddress: ip } });
  return true;
}
