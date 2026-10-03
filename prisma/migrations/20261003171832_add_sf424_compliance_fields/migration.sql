-- AlterTable
ALTER TABLE "Grant" ADD COLUMN     "cfdaNumber" TEXT,
ADD COLUMN     "opportunityNumber" TEXT;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "authorizedRepEmail" TEXT,
ADD COLUMN     "authorizedRepName" TEXT,
ADD COLUMN     "authorizedRepPhone" TEXT,
ADD COLUMN     "authorizedRepTitle" TEXT,
ADD COLUMN     "congressionalDistrictApplicant" TEXT,
ADD COLUMN     "congressionalDistrictProject" TEXT,
ADD COLUMN     "county" TEXT,
ADD COLUMN     "orgPhone" TEXT,
ADD COLUMN     "streetAddress" TEXT,
ADD COLUMN     "zipCode" TEXT;
