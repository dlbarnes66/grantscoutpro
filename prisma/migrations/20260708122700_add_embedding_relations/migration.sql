/*
  Warnings:

  - You are about to drop the column `pageId` on the `Embedding` table. All the data in the column will be lost.
  - Added the required column `workspaceId` to the `Embedding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Embedding" DROP CONSTRAINT "Embedding_pageId_fkey";

-- AlterTable
ALTER TABLE "Embedding" DROP COLUMN "pageId",
ADD COLUMN     "documentId" TEXT,
ADD COLUMN     "grantPageId" TEXT,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_grantPageId_fkey" FOREIGN KEY ("grantPageId") REFERENCES "GrantPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
