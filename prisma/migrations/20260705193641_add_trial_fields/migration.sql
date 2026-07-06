-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialEndAt" TIMESTAMP(3),
ADD COLUMN     "trialStartAt" TIMESTAMP(3);
