-- AlterTable
ALTER TABLE "RiskHistory" ADD COLUMN     "workspaceId" TEXT;

-- AddForeignKey
ALTER TABLE "RiskHistory" ADD CONSTRAINT "RiskHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
