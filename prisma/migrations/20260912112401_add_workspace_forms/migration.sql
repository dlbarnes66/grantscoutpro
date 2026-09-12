-- CreateTable
CREATE TABLE "WorkspaceForm" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "grantId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "shareSlug" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceFormResponse" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "respondentEmail" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceFormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceForm_shareSlug_key" ON "WorkspaceForm"("shareSlug");

-- CreateIndex
CREATE INDEX "WorkspaceForm_workspaceId_idx" ON "WorkspaceForm"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceFormResponse_formId_idx" ON "WorkspaceFormResponse"("formId");

-- CreateIndex
CREATE INDEX "WorkspaceFormResponse_workspaceId_idx" ON "WorkspaceFormResponse"("workspaceId");

-- AddForeignKey
ALTER TABLE "WorkspaceForm" ADD CONSTRAINT "WorkspaceForm_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceForm" ADD CONSTRAINT "WorkspaceForm_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceFormResponse" ADD CONSTRAINT "WorkspaceFormResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "WorkspaceForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
