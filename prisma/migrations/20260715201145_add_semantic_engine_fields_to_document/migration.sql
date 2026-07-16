-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "embedding" DOUBLE PRECISION[],
ADD COLUMN     "matchScore" DOUBLE PRECISION,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
