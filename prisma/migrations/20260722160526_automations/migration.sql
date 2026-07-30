-- CreateIndex
CREATE INDEX "Grant_deadline_idx" ON "Grant"("deadline");

-- CreateIndex
CREATE INDEX "Grant_category_idx" ON "Grant"("category");

-- CreateIndex
CREATE INDEX "Grant_agency_idx" ON "Grant"("agency");

-- CreateIndex
CREATE INDEX "Grant_workspaceId_idx" ON "Grant"("workspaceId");
