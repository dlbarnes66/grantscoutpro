/*
  Warnings:

  - Added the required column `grantId` to the `GrantDraft` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GrantDraft" ADD COLUMN     "grantId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "GrantDraft" ADD CONSTRAINT "GrantDraft_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
