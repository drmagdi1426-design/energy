/**
 * PDPL data-retention job.
 *
 * Anonymizes responses older than DATA_RETENTION_MONTHS: clears the
 * optional team/department/cycleLabel fields and stamps `anonymizedAt`.
 * Quadrant-audit percentages, behavioral item scores, and computed scores
 * are kept — they carry no identifying information and are the basis for
 * historical trend reporting — only the respondent-supplied free-text
 * context is scrubbed.
 *
 * Run manually:
 *   npm run retention:run
 *
 * Or schedule it (recommended): a daily cron entry, e.g.
 *   0 3 * * *  cd /path/to/app && npm run retention:run >> /var/log/tharwah-retention.log 2>&1
 * or your hosting provider's scheduled-job/cron feature pointed at the same
 * command. See README "PDPL compliance" for the manual fallback if no
 * scheduler is available.
 */
import { prisma } from '../src/lib/prisma';

async function main() {
  const months = Number(process.env.DATA_RETENTION_MONTHS ?? 18);
  if (!Number.isFinite(months) || months <= 0) {
    throw new Error(`DATA_RETENTION_MONTHS must be a positive number, got: ${process.env.DATA_RETENTION_MONTHS}`);
  }

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  const result = await prisma.response.updateMany({
    where: {
      submittedAt: { lt: cutoff },
      anonymizedAt: null,
    },
    data: {
      team: null,
      department: null,
      cycleLabel: null,
      anonymizedAt: new Date(),
    },
  });

  console.log(
    `Retention job: anonymized ${result.count} response(s) submitted before ${cutoff.toISOString()} (retention window: ${months} months).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
