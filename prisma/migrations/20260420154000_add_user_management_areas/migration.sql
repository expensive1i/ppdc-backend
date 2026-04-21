-- CreateEnum
CREATE TYPE "ManagementArea" AS ENUM ('USER_MANAGEMENT', 'CAMPAIGN_MANAGEMENT');

-- AlterTable
ALTER TABLE "users"
ADD COLUMN "management_areas" "ManagementArea"[] NOT NULL DEFAULT ARRAY['USER_MANAGEMENT'::"ManagementArea", 'CAMPAIGN_MANAGEMENT'::"ManagementArea"];