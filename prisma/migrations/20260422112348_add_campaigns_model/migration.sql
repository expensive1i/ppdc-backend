-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'RUNNING', 'CLOSED');

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "campaign_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "beneficiary_name" TEXT NOT NULL,
    "short_summary" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "goal_amount" DOUBLE PRECISION NOT NULL,
    "total_funds_raised" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paystack_sub_acct_code" TEXT,
    "show_progress_publicly" BOOLEAN NOT NULL DEFAULT true,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_campaign_code_key" ON "campaigns"("campaign_code");

-- CreateIndex
CREATE INDEX "campaigns_status_is_disabled_idx" ON "campaigns"("status", "is_disabled");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
