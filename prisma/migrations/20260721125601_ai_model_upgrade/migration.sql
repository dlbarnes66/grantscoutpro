/*
  Warnings:

  - You are about to drop the column `fundingRange` on the `Grant` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Grant` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Grant" DROP COLUMN "fundingRange",
DROP COLUMN "url";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "capacity";

-- CreateTable
CREATE TABLE "GrantTruthfulnessHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "factualAccuracy" INTEGER NOT NULL,
    "evidenceAlignment" INTEGER NOT NULL,
    "truthConsistency" INTEGER NOT NULL,
    "narrativeTruth" INTEGER NOT NULL,
    "dataTruth" INTEGER NOT NULL,
    "scoringTruth" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "analysis" TEXT NOT NULL,
    "factualFactors" TEXT NOT NULL,
    "evidenceFactors" TEXT NOT NULL,
    "consistencyFactors" TEXT NOT NULL,
    "narrativeFactors" TEXT NOT NULL,
    "dataFactors" TEXT NOT NULL,
    "scoringFactors" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,

    CONSTRAINT "GrantTruthfulnessHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantEvidenceHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "evidenceStrength" INTEGER NOT NULL,
    "evidenceRelevance" INTEGER NOT NULL,
    "evidenceSufficiency" INTEGER NOT NULL,
    "evidenceConsistency" INTEGER NOT NULL,
    "evidenceQuality" INTEGER NOT NULL,
    "evidenceAlignment" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "analysis" TEXT NOT NULL,
    "strengthFactors" TEXT NOT NULL,
    "relevanceFactors" TEXT NOT NULL,
    "sufficiencyFactors" TEXT NOT NULL,
    "consistencyFactors" TEXT NOT NULL,
    "qualityFactors" TEXT NOT NULL,
    "alignmentFactors" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,

    CONSTRAINT "GrantEvidenceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantCompletenessHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "sectionCompleteness" INTEGER NOT NULL,
    "narrativeCompleteness" INTEGER NOT NULL,
    "dataCompleteness" INTEGER NOT NULL,
    "complianceCompleteness" INTEGER NOT NULL,
    "applicationCompleteness" INTEGER NOT NULL,
    "evidenceCompleteness" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "analysis" TEXT NOT NULL,
    "sectionFactors" TEXT NOT NULL,
    "narrativeFactors" TEXT NOT NULL,
    "dataFactors" TEXT NOT NULL,
    "complianceFactors" TEXT NOT NULL,
    "applicationFactors" TEXT NOT NULL,
    "evidenceFactors" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,

    CONSTRAINT "GrantCompletenessHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantQualityHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "writingQuality" INTEGER NOT NULL,
    "structuralQuality" INTEGER NOT NULL,
    "professionalQuality" INTEGER NOT NULL,
    "persuasiveQuality" INTEGER NOT NULL,
    "strategicQuality" INTEGER NOT NULL,
    "reviewerQuality" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "analysis" TEXT NOT NULL,
    "writingFactors" TEXT NOT NULL,
    "structuralFactors" TEXT NOT NULL,
    "professionalFactors" TEXT NOT NULL,
    "persuasiveFactors" TEXT NOT NULL,
    "strategicFactors" TEXT NOT NULL,
    "reviewerFactors" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,

    CONSTRAINT "GrantQualityHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantOptimizationHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "narrativeOptimization" INTEGER NOT NULL,
    "budgetOptimization" INTEGER NOT NULL,
    "timelineOptimization" INTEGER NOT NULL,
    "strategyOptimization" INTEGER NOT NULL,
    "complianceOptimization" INTEGER NOT NULL,
    "readinessOptimization" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "analysis" TEXT NOT NULL,
    "narrativeFactors" TEXT NOT NULL,
    "budgetFactors" TEXT NOT NULL,
    "timelineFactors" TEXT NOT NULL,
    "strategyFactors" TEXT NOT NULL,
    "complianceFactors" TEXT NOT NULL,
    "readinessFactors" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,

    CONSTRAINT "GrantOptimizationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantEnhancementHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "narrativeEnhancement" INTEGER NOT NULL,
    "structuralEnhancement" INTEGER NOT NULL,
    "persuasiveEnhancement" INTEGER NOT NULL,
    "complianceEnhancement" INTEGER NOT NULL,
    "evidenceEnhancement" INTEGER NOT NULL,
    "strategicEnhancement" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "analysis" TEXT NOT NULL,
    "narrativeFactors" TEXT NOT NULL,
    "structuralFactors" TEXT NOT NULL,
    "persuasiveFactors" TEXT NOT NULL,
    "complianceFactors" TEXT NOT NULL,
    "evidenceFactors" TEXT NOT NULL,
    "strategicFactors" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,

    CONSTRAINT "GrantEnhancementHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantAuditHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "complianceAudit" INTEGER NOT NULL,
    "financialAudit" INTEGER NOT NULL,
    "documentationAudit" INTEGER NOT NULL,
    "riskAudit" INTEGER NOT NULL,
    "eligibilityAudit" INTEGER NOT NULL,
    "integrityAudit" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "analysis" TEXT NOT NULL,
    "complianceFactors" TEXT NOT NULL,
    "financialFactors" TEXT NOT NULL,
    "documentationFactors" TEXT NOT NULL,
    "riskFactors" TEXT NOT NULL,
    "eligibilityFactors" TEXT NOT NULL,
    "integrityFactors" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,

    CONSTRAINT "GrantAuditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantReviewerHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "reviewerFit" INTEGER NOT NULL,
    "reviewerMerit" INTEGER NOT NULL,
    "reviewerCapacity" INTEGER NOT NULL,
    "reviewerFeasibility" INTEGER NOT NULL,
    "reviewerImpact" INTEGER NOT NULL,
    "reviewerCompetitiveness" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "analysis" TEXT NOT NULL,
    "fitFactors" TEXT NOT NULL,
    "meritFactors" TEXT NOT NULL,
    "capacityFactors" TEXT NOT NULL,
    "feasibilityFactors" TEXT NOT NULL,
    "impactFactors" TEXT NOT NULL,
    "competitivenessFactors" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,

    CONSTRAINT "GrantReviewerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantDecisionHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "decisionReadiness" INTEGER NOT NULL,
    "decisionConfidence" INTEGER NOT NULL,
    "decisionRisk" INTEGER NOT NULL,
    "decisionOpportunity" INTEGER NOT NULL,
    "decisionStrategyScore" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "decisionOutcome" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "readinessFactors" TEXT NOT NULL,
    "confidenceFactors" TEXT NOT NULL,
    "riskFactors" TEXT NOT NULL,
    "opportunityFactors" TEXT NOT NULL,
    "strategyFactors" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,

    CONSTRAINT "GrantDecisionHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GrantTruthfulnessHistory" ADD CONSTRAINT "GrantTruthfulnessHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantTruthfulnessHistory" ADD CONSTRAINT "GrantTruthfulnessHistory_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantTruthfulnessHistory" ADD CONSTRAINT "GrantTruthfulnessHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEvidenceHistory" ADD CONSTRAINT "GrantEvidenceHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEvidenceHistory" ADD CONSTRAINT "GrantEvidenceHistory_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEvidenceHistory" ADD CONSTRAINT "GrantEvidenceHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantCompletenessHistory" ADD CONSTRAINT "GrantCompletenessHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantCompletenessHistory" ADD CONSTRAINT "GrantCompletenessHistory_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantCompletenessHistory" ADD CONSTRAINT "GrantCompletenessHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantQualityHistory" ADD CONSTRAINT "GrantQualityHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantQualityHistory" ADD CONSTRAINT "GrantQualityHistory_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantQualityHistory" ADD CONSTRAINT "GrantQualityHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantOptimizationHistory" ADD CONSTRAINT "GrantOptimizationHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantOptimizationHistory" ADD CONSTRAINT "GrantOptimizationHistory_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantOptimizationHistory" ADD CONSTRAINT "GrantOptimizationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEnhancementHistory" ADD CONSTRAINT "GrantEnhancementHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEnhancementHistory" ADD CONSTRAINT "GrantEnhancementHistory_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEnhancementHistory" ADD CONSTRAINT "GrantEnhancementHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantAuditHistory" ADD CONSTRAINT "GrantAuditHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantAuditHistory" ADD CONSTRAINT "GrantAuditHistory_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantAuditHistory" ADD CONSTRAINT "GrantAuditHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantReviewerHistory" ADD CONSTRAINT "GrantReviewerHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantReviewerHistory" ADD CONSTRAINT "GrantReviewerHistory_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantReviewerHistory" ADD CONSTRAINT "GrantReviewerHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantDecisionHistory" ADD CONSTRAINT "GrantDecisionHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantDecisionHistory" ADD CONSTRAINT "GrantDecisionHistory_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantDecisionHistory" ADD CONSTRAINT "GrantDecisionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
