import { prisma } from '@/lib/prisma';

// PDPL audit trail: records every admin view/export/delete of response data,
// with who and when. Never include raw personal data in `detail`.
export async function logAdminAction(
  adminUsername: string,
  action: string,
  detail?: string,
  ipAddress?: string,
): Promise<void> {
  await prisma.auditLog.create({
    data: { adminUsername, action, detail, ipAddress },
  });
}
