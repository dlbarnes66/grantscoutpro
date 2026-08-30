-- AlterTable
ALTER TABLE "BillingLog" ADD COLUMN     "errorCode" TEXT,
ADD COLUMN     "orgId" TEXT,
ADD COLUMN     "payload" JSONB,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free';

-- CreateIndex
CREATE INDEX "BillingLog_workspaceId_idx" ON "BillingLog"("workspaceId");

-- CreateIndex
CREATE INDEX "BillingLog_userId_idx" ON "BillingLog"("userId");

-- CreateIndex
CREATE INDEX "BillingLog_orgId_idx" ON "BillingLog"("orgId");

-- CreateIndex
CREATE INDEX "BillingLog_type_idx" ON "BillingLog"("type");

-- AddForeignKey
ALTER TABLE "BillingLog" ADD CONSTRAINT "BillingLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingLog" ADD CONSTRAINT "BillingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingLog" ADD CONSTRAINT "BillingLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;
