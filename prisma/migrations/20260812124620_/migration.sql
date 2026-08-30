/*
  Warnings:

  - You are about to drop the column `errorCode` on the `BillingLog` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `BillingLog` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Workspace` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BillingLog_orgId_idx";

-- DropIndex
DROP INDEX "BillingLog_type_idx";

-- DropIndex
DROP INDEX "BillingLog_userId_idx";

-- DropIndex
DROP INDEX "BillingLog_workspaceId_idx";

-- AlterTable
ALTER TABLE "BillingLog" DROP COLUMN "errorCode",
DROP COLUMN "payload";

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "plan";

-- CreateTable
CREATE TABLE "WorkspaceLocation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "county" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationIntelligence" (
    "id" TEXT NOT NULL,
    "workspaceLocationId" TEXT NOT NULL,
    "population" INTEGER,
    "medianIncome" INTEGER,
    "povertyRate" DOUBLE PRECISION,
    "unemploymentRate" DOUBLE PRECISION,
    "ruralUrbanCode" TEXT,
    "opportunityZone" BOOLEAN,
    "distressedCommunity" BOOLEAN,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationIntelligence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceLocation_workspaceId_idx" ON "WorkspaceLocation"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "LocationIntelligence_workspaceLocationId_key" ON "LocationIntelligence"("workspaceLocationId");

-- CreateIndex
CREATE INDEX "LocationIntelligence_workspaceLocationId_idx" ON "LocationIntelligence"("workspaceLocationId");

-- AddForeignKey
ALTER TABLE "WorkspaceLocation" ADD CONSTRAINT "WorkspaceLocation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationIntelligence" ADD CONSTRAINT "LocationIntelligence_workspaceLocationId_fkey" FOREIGN KEY ("workspaceLocationId") REFERENCES "WorkspaceLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
