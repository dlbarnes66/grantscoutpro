/*
  Warnings:

  - Made the column `title` on table `WorkspaceDocument` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WorkspaceDocument" ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "content" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "GrantAccess" (
    "id" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canRunAI" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GrantAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantId" TEXT,
    "documentId" TEXT,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GrantAccess_grantId_userId_key" ON "GrantAccess"("grantId", "userId");

-- AddForeignKey
ALTER TABLE "GrantAccess" ADD CONSTRAINT "GrantAccess_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantAccess" ADD CONSTRAINT "GrantAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
