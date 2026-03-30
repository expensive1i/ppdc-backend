-- CreateEnum
CREATE TYPE "ContentCountry" AS ENUM ('UK', 'US', 'NIGERIA');

-- CreateEnum
CREATE TYPE "ContentResource" AS ENUM ('BLOGS', 'UPDATES', 'PROGRAMS', 'CAREERS', 'HERO_CONTENTS', 'RESOURCES');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContactSubmissionStatus" AS ENUM ('NEW', 'ACKNOWLEDGED');

-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL,
    "country" "ContentCountry" NOT NULL,
    "resource" "ContentResource" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publish_date" DATE,
    "reading_time" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "country" "ContentCountry" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactSubmissionStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_items_country_resource_status_idx" ON "content_items"("country", "resource", "status");

-- CreateIndex
CREATE INDEX "content_items_country_resource_publish_date_idx" ON "content_items"("country", "resource", "publish_date");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_country_resource_slug_key" ON "content_items"("country", "resource", "slug");

-- CreateIndex
CREATE INDEX "contact_submissions_country_status_idx" ON "contact_submissions"("country", "status");

-- CreateIndex
CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions"("created_at");

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
