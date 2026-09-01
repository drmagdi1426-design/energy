-- CreateEnum
CREATE TYPE "Quadrant" AS ENUM ('SURVIVAL', 'PERFORMANCE', 'BURNOUT', 'RENEWAL');

-- CreateEnum
CREATE TYPE "BehavioralItemCode" AS ENUM ('S1', 'S2', 'P1', 'P2', 'B1', 'B2', 'R1', 'R2');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('EN', 'AR');

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locale" "Locale" NOT NULL,
    "team" TEXT,
    "department" TEXT,
    "cycleLabel" TEXT,
    "consentAcceptedAt" TIMESTAMP(3) NOT NULL,
    "anonymizedAt" TIMESTAMP(3),

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuadrantAudit" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "survivalPct" INTEGER NOT NULL,
    "performancePct" INTEGER NOT NULL,
    "burnoutPct" INTEGER NOT NULL,
    "renewalPct" INTEGER NOT NULL,

    CONSTRAINT "QuadrantAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BehavioralItem" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "itemCode" "BehavioralItemCode" NOT NULL,
    "rawScore" INTEGER NOT NULL,

    CONSTRAINT "BehavioralItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComputedScore" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "survivalSum" INTEGER NOT NULL,
    "performanceSum" INTEGER NOT NULL,
    "burnoutSum" INTEGER NOT NULL,
    "renewalSum" INTEGER NOT NULL,
    "dominant" "Quadrant",
    "isTie" BOOLEAN NOT NULL DEFAULT false,
    "tiedQuadrants" "Quadrant"[],
    "survivalZone" TEXT,
    "performanceZone" TEXT,
    "burnoutZone" TEXT,
    "renewalZone" TEXT,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComputedScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminUsername" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionRateLimit" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Response_submittedAt_idx" ON "Response"("submittedAt");

-- CreateIndex
CREATE INDEX "Response_cycleLabel_idx" ON "Response"("cycleLabel");

-- CreateIndex
CREATE INDEX "Response_team_idx" ON "Response"("team");

-- CreateIndex
CREATE UNIQUE INDEX "QuadrantAudit_responseId_key" ON "QuadrantAudit"("responseId");

-- CreateIndex
CREATE UNIQUE INDEX "BehavioralItem_responseId_itemCode_key" ON "BehavioralItem"("responseId", "itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "ComputedScore_responseId_key" ON "ComputedScore"("responseId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE INDEX "LoginAttempt_username_createdAt_idx" ON "LoginAttempt"("username", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipAddress_createdAt_idx" ON "LoginAttempt"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "SubmissionRateLimit_ipAddress_createdAt_idx" ON "SubmissionRateLimit"("ipAddress", "createdAt");

-- AddForeignKey
ALTER TABLE "QuadrantAudit" ADD CONSTRAINT "QuadrantAudit_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehavioralItem" ADD CONSTRAINT "BehavioralItem_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComputedScore" ADD CONSTRAINT "ComputedScore_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response"("id") ON DELETE CASCADE ON UPDATE CASCADE;
