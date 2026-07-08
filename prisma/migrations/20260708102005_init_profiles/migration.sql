-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'AGENT', 'LOADER', 'HOST', 'GUEST');

-- CreateEnum
CREATE TYPE "HostType" AS ENUM ('RENTAL_PROPERTY_REGISTERED', 'INDIVIDUAL_PROPERTY', 'CAR_RENTAL', 'RESTAURANT', 'BARBERSHOP', 'SPA_SALON');

-- CreateEnum
CREATE TYPE "HostApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('GOV_ID', 'KKF_CERTIFICATE', 'OWNERSHIP_PROOF', 'PROPERTY_INSURANCE', 'TAX_DOCUMENT', 'HANDEL_PERMIT', 'LOGO', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "passwordResetCode" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "countriesToVisit" TEXT[],
    "interests" TEXT,
    "allergies" TEXT,
    "extraText" TEXT,
    "subscriptionStatus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hostTypes" "HostType"[],
    "businessName" TEXT,
    "location" TEXT,
    "address" TEXT,
    "country" TEXT,
    "city" TEXT,
    "state" TEXT,
    "registrationNumber" TEXT,
    "description" TEXT,
    "approvalStatus" "HostApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_documents" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "host_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "guest_profiles_userId_key" ON "guest_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_profiles_userId_key" ON "agent_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "host_profiles_userId_key" ON "host_profiles"("userId");

-- AddForeignKey
ALTER TABLE "guest_profiles" ADD CONSTRAINT "guest_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_profiles" ADD CONSTRAINT "agent_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_profiles" ADD CONSTRAINT "host_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_documents" ADD CONSTRAINT "host_documents_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "host_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
