/*
  Warnings:

  - You are about to drop the column `status` on the `ApplicationHistory` table. All the data in the column will be lost.
  - You are about to drop the column `versionNumber` on the `ApplicationVersion` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `grantIds` on the `PortfolioOptimization` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `PortfolioOptimization` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `agency` on the `SavedGrant` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `SavedGrant` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `SavedGrant` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `SavedGrant` table. All the data in the column will be lost.
  - You are about to drop the column `count` on the `SearchAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `lastSearchedAt` on the `SearchAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `addons` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `isLocked` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `trialEndAt` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `trialStartAt` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `WorkspaceBilling` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `WorkspaceBilling` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `WorkspaceInsight` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `WorkspaceInsight` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `WorkspaceInsight` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `WorkspaceInsight` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `WorkspaceNotification` table. All the data in the column will be lost.
  - You are about to drop the `FederalGrant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GrantPreview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IngestionLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `durationMs` to the `SearchAnalytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultCount` to the `SearchAnalytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Workspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Workspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Workspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryWorkspaceId` to the `WorkspaceInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondaryWorkspaceId` to the `WorkspaceInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `WorkspaceInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WorkspaceNotification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "SavedGrant" DROP CONSTRAINT "SavedGrant_grantId_fkey";

-- DropForeignKey
ALTER TABLE "Workspace" DROP CONSTRAINT "Workspace_orgId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceInsight" DROP CONSTRAINT "WorkspaceInsight_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "ApplicationHistory" DROP COLUMN "status",
ADD COLUMN     "action" TEXT;

-- AlterTable
ALTER TABLE "ApplicationVersion" DROP COLUMN "versionNumber";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "details",
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "BillingLog" ALTER COLUMN "message" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PortfolioOptimization" DROP COLUMN "grantIds",
DROP COLUMN "result",
ADD COLUMN     "details" JSONB,
ADD COLUMN     "grantId" TEXT;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "updatedAt",
ALTER COLUMN "workspaceId" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SavedGrant" DROP COLUMN "agency",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
DROP COLUMN "url";

-- AlterTable
ALTER TABLE "SearchAnalytics" DROP COLUMN "count",
DROP COLUMN "lastSearchedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "durationMs" INTEGER NOT NULL,
ADD COLUMN     "resultCount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SearchHistory" ADD COLUMN     "resultCount" INTEGER;

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "addons",
DROP COLUMN "isLocked",
DROP COLUMN "trialEndAt",
DROP COLUMN "trialStartAt",
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "trialActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialEnd" TIMESTAMP(3),
ADD COLUMN     "trialLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialStart" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "orgId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkspaceBilling" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "WorkspaceInsight" DROP COLUMN "metadata",
DROP COLUMN "summary",
DROP COLUMN "type",
DROP COLUMN "workspaceId",
ADD COLUMN     "aiScore" DOUBLE PRECISION,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "primaryWorkspaceId" TEXT NOT NULL,
ADD COLUMN     "secondaryWorkspaceId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkspaceNotification" DROP COLUMN "metadata",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "FederalGrant";

-- DropTable
DROP TABLE "GrantPreview";

-- DropTable
DROP TABLE "IngestionLog";

-- CreateTable
CREATE TABLE "WorkspaceReport" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceBudget" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceDocument" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceFile" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceEmbedding" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "vector" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceAddon" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddonBilling" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "addonType" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddonBilling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceReport" ADD CONSTRAINT "WorkspaceReport_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceReport" ADD CONSTRAINT "WorkspaceReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceBudget" ADD CONSTRAINT "WorkspaceBudget_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceDocument" ADD CONSTRAINT "WorkspaceDocument_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceFile" ADD CONSTRAINT "WorkspaceFile_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceEmbedding" ADD CONSTRAINT "WorkspaceEmbedding_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceAddon" ADD CONSTRAINT "WorkspaceAddon_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonBilling" ADD CONSTRAINT "AddonBilling_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInsight" ADD CONSTRAINT "WorkspaceInsight_primaryWorkspaceId_fkey" FOREIGN KEY ("primaryWorkspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInsight" ADD CONSTRAINT "WorkspaceInsight_secondaryWorkspaceId_fkey" FOREIGN KEY ("secondaryWorkspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedGrant" ADD CONSTRAINT "SavedGrant_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioOptimization" ADD CONSTRAINT "PortfolioOptimization_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
