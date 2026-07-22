-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "claim_requests" (
    "id" TEXT NOT NULL,
    "directoryListingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idCardUrl" TEXT NOT NULL,
    "proofOfOwnershipUrl" TEXT NOT NULL,
    "businessRegistration" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "claim_requests" ADD CONSTRAINT "claim_requests_directoryListingId_fkey" FOREIGN KEY ("directoryListingId") REFERENCES "directory_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_requests" ADD CONSTRAINT "claim_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
