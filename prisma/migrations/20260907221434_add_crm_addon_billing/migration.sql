/*
  Warnings:

  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `WorkspaceAddon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceId,addonType]` on the table `WorkspaceAddon` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WorkspaceAddon" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceAddon_stripeSubscriptionId_key" ON "WorkspaceAddon"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceAddon_workspaceId_addonType_key" ON "WorkspaceAddon"("workspaceId", "addonType");
