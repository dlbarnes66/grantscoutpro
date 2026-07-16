/*
  Warnings:

  - You are about to drop the column `addonType` on the `AddonBilling` table. All the data in the column will be lost.
  - You are about to drop the column `periodEnd` on the `AddonBilling` table. All the data in the column will be lost.
  - You are about to drop the column `periodStart` on the `AddonBilling` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `AddonBilling` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `WorkspaceAddon` table. All the data in the column will be lost.
  - Added the required column `addonId` to the `AddonBilling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `AddonBilling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `AddonBilling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addonType` to the `WorkspaceAddon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AddonBilling" DROP COLUMN "addonType",
DROP COLUMN "periodEnd",
DROP COLUMN "periodStart",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "addonId" TEXT NOT NULL,
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "period" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'inactive';

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "allowedDowngradeTiers" TEXT[] DEFAULT ARRAY['basic', 'team']::TEXT[],
ADD COLUMN     "billingPeriod" TEXT NOT NULL DEFAULT 'monthly',
ADD COLUMN     "billingRenewalDate" TIMESTAMP(3),
ADD COLUMN     "billingStatus" TEXT NOT NULL DEFAULT 'inactive',
ADD COLUMN     "currentSeats" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxSeats" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pilotActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pilotEndsAt" TIMESTAMP(3),
ADD COLUMN     "pilotLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pilotMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pilotStart" TIMESTAMP(3),
ADD COLUMN     "pilotTier" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "subscriptionTier" TEXT NOT NULL DEFAULT 'basic',
ADD COLUMN     "trialBannerColor" TEXT,
ADD COLUMN     "trialDaysRemaining" INTEGER,
ADD COLUMN     "trialPromoCode" TEXT DEFAULT 'promo10';

-- AlterTable
ALTER TABLE "WorkspaceAddon" DROP COLUMN "type",
ADD COLUMN     "addonType" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AddonBilling" ADD CONSTRAINT "AddonBilling_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "WorkspaceAddon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
