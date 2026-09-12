-- CreateTable
CREATE TABLE "WorkspaceInsightLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceInsightLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceInsightLog_workspaceId_idx" ON "WorkspaceInsightLog"("workspaceId");

-- AddForeignKey
ALTER TABLE "WorkspaceInsightLog" ADD CONSTRAINT "WorkspaceInsightLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
