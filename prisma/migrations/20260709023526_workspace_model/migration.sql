-- CreateEnum
CREATE TYPE "GrantSource" AS ENUM ('FEDERAL', 'STATE', 'FOUNDATION', 'PHILANTHROPIC');

-- CreateEnum
CREATE TYPE "GrantTierAccess" AS ENUM ('FEDERAL_ONLY', 'FEDERAL_STATE', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Grant" ADD COLUMN     "aiAlignmentScore" DOUBLE PRECISION,
ADD COLUMN     "aiCompetitivenessScore" DOUBLE PRECISION,
ADD COLUMN     "aiEligibilityScore" DOUBLE PRECISION,
ADD COLUMN     "aiReadinessScore" DOUBLE PRECISION,
ADD COLUMN     "aiRecommendations" JSONB,
ADD COLUMN     "aiRiskScore" DOUBLE PRECISION,
ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "amountMax" DOUBLE PRECISION,
ADD COLUMN     "amountMin" DOUBLE PRECISION,
ADD COLUMN     "awardCeiling" DOUBLE PRECISION,
ADD COLUMN     "awardFloor" DOUBLE PRECISION,
ADD COLUMN     "eligibility" JSONB,
ADD COLUMN     "eligibleApplicants" TEXT,
ADD COLUMN     "eligibleStates" TEXT,
ADD COLUMN     "expectedAwards" INTEGER,
ADD COLUMN     "foundation990PF" JSONB,
ADD COLUMN     "foundationBoardMembers" JSONB,
ADD COLUMN     "foundationEIN" TEXT,
ADD COLUMN     "foundationGivingAreas" TEXT,
ADD COLUMN     "foundationMission" TEXT,
ADD COLUMN     "foundationName" TEXT,
ADD COLUMN     "foundationPastGrantees" JSONB,
ADD COLUMN     "foundationRestrictions" TEXT,
ADD COLUMN     "geographicFocus" TEXT,
ADD COLUMN     "ineligibleApplicants" TEXT,
ADD COLUMN     "philanthropicFocus" TEXT,
ADD COLUMN     "philanthropicHistory" JSONB,
ADD COLUMN     "philanthropicType" TEXT,
ADD COLUMN     "postedDate" TIMESTAMP(3),
ADD COLUMN     "source" "GrantSource" NOT NULL DEFAULT 'FEDERAL',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "tierAccess" "GrantTierAccess" NOT NULL DEFAULT 'FEDERAL_ONLY',
ADD COLUMN     "totalFunding" DOUBLE PRECISION,
ADD COLUMN     "updatedDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "WorkspaceNotification" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkspaceNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchAnalytics" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastSearchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceInsight" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceBilling" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "usageSearches" INTEGER NOT NULL DEFAULT 0,
    "usageUploads" INTEGER NOT NULL DEFAULT 0,
    "usageMembers" INTEGER NOT NULL DEFAULT 1,
    "usageAI" INTEGER NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceBilling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceBilling_workspaceId_key" ON "WorkspaceBilling"("workspaceId");

-- AddForeignKey
ALTER TABLE "WorkspaceNotification" ADD CONSTRAINT "WorkspaceNotification_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceNotification" ADD CONSTRAINT "WorkspaceNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchAnalytics" ADD CONSTRAINT "SearchAnalytics_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInsight" ADD CONSTRAINT "WorkspaceInsight_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceBilling" ADD CONSTRAINT "WorkspaceBilling_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
