/*
  Warnings:

  - You are about to drop the column `score` on the `GrantPreview` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `GrantPreview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `SavedGrant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SavedGrant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GrantPreview" DROP COLUMN "score",
ADD COLUMN     "agency" TEXT,
ADD COLUMN     "competitiveness" DOUBLE PRECISION,
ADD COLUMN     "eligibilityScore" DOUBLE PRECISION,
ADD COLUMN     "fitExplanation" TEXT,
ADD COLUMN     "fitScore" DOUBLE PRECISION,
ADD COLUMN     "fundingStrength" DOUBLE PRECISION,
ADD COLUMN     "nextSteps" TEXT,
ADD COLUMN     "overallScore" DOUBLE PRECISION,
ADD COLUMN     "riskScore" DOUBLE PRECISION,
ADD COLUMN     "risks" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SavedGrant" ADD COLUMN     "agency" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT;

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationName" TEXT,
    "organizationType" TEXT,
    "mission" TEXT,
    "website" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "nonprofitStatus" TEXT,
    "ein" TEXT,
    "staffSize" INTEGER,
    "annualBudget" INTEGER,
    "grantExperience" TEXT,
    "focusAreas" TEXT[],
    "populationsServed" TEXT[],
    "geographicService" TEXT[],
    "pastGrants" TEXT,
    "pastWins" INTEGER,
    "pastLosses" INTEGER,
    "strategicGoals" TEXT,
    "priorityAreas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantComparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrantComparison_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantComparison" ADD CONSTRAINT "GrantComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
