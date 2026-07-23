-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID');

-- AlterTable
ALTER TABLE "guest_profiles" ADD COLUMN     "stripeCustomerId" TEXT;

-- AlterTable
ALTER TABLE "host_profiles" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "stripeCustomerId" TEXT;
