-- DropForeignKey
ALTER TABLE "Grant" DROP CONSTRAINT "Grant_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Grant" ALTER COLUMN "workspaceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Grant" ADD CONSTRAINT "Grant_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
