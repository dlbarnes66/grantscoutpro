-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN "legalName" TEXT,
ADD COLUMN "websites" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "eo12372Status" TEXT,
ADD COLUMN "federalDebtDelinquent" BOOLEAN;
