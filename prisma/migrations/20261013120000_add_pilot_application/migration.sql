-- CreateTable
CREATE TABLE "PilotApplication" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "orgType" TEXT NOT NULL,
    "website" TEXT,
    "state" TEXT,
    "challenge" TEXT NOT NULL,
    "feedbackConsent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PilotApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PilotApplication_email_key" ON "PilotApplication"("email");

-- CreateIndex
CREATE INDEX "PilotApplication_status_createdAt_idx" ON "PilotApplication"("status", "createdAt");
