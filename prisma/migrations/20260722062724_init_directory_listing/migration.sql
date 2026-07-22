/*
  Warnings:

  - The `permissions` column on the `agent_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AdminPermission" AS ENUM ('LOAD_DIRECTORY', 'APPROVE_CLAIMS', 'MANAGE_GUESTS', 'MANAGE_TEAM', 'VIEW_REVENUE');

-- CreateEnum
CREATE TYPE "ListingApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- AlterEnum
ALTER TYPE "ListingCategory" ADD VALUE 'FOOD';

-- AlterTable
ALTER TABLE "agent_profiles" ADD COLUMN     "assignedCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "permissions",
ADD COLUMN     "permissions" "AdminPermission"[] DEFAULT ARRAY[]::"AdminPermission"[];

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "approvalStatus" "ListingApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "service_details" ADD COLUMN     "availableTimeSlots" TEXT[];

-- AlterTable
ALTER TABLE "service_packages" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "food_details" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "food_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_items" (
    "id" TEXT NOT NULL,
    "foodDetailsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "directory_listings" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "primaryImage" TEXT NOT NULL,
    "loadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "directory_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "food_details_listingId_key" ON "food_details"("listingId");

-- AddForeignKey
ALTER TABLE "food_details" ADD CONSTRAINT "food_details_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_items" ADD CONSTRAINT "food_items_foodDetailsId_fkey" FOREIGN KEY ("foodDetailsId") REFERENCES "food_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directory_listings" ADD CONSTRAINT "directory_listings_loadedById_fkey" FOREIGN KEY ("loadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
