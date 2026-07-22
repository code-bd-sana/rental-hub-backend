-- CreateEnum
CREATE TYPE "DirectoryStatus" AS ENUM ('UNCLAIMED', 'CLAIMED');

-- AlterTable
ALTER TABLE "directory_listings" ADD COLUMN     "status" "DirectoryStatus" NOT NULL DEFAULT 'UNCLAIMED';
