/*
  Warnings:

  - You are about to drop the column `text` on the `DocumentEmbedding` table. All the data in the column will be lost.
  - You are about to drop the column `vector` on the `DocumentEmbedding` table. All the data in the column will be lost.
  - Added the required column `content` to the `DocumentEmbedding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `embedding` to the `DocumentEmbedding` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DocumentEmbedding_documentId_key";

-- AlterTable
ALTER TABLE "DocumentEmbedding" DROP COLUMN "text",
DROP COLUMN "vector",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "embedding" BYTEA NOT NULL;

-- CreateIndex
CREATE INDEX "DocumentEmbedding_workspaceId_idx" ON "DocumentEmbedding"("workspaceId");

-- CreateIndex
CREATE INDEX "DocumentEmbedding_documentId_idx" ON "DocumentEmbedding"("documentId");
