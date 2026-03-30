-- CreateEnum
CREATE TYPE "CountryScope" AS ENUM ('UNITED_KINGDOM', 'UNITED_STATES', 'NIGERIA');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "all_platforms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "country_scopes" "CountryScope"[] DEFAULT ARRAY[]::"CountryScope"[];
