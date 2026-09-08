-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "budget" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "currentProjects" JSONB,
ADD COLUMN     "lastScannedAt" TIMESTAMP(3);
