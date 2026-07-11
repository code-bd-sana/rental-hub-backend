-- AlterTable
ALTER TABLE "guest_profiles" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'USD',
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "language" TEXT DEFAULT 'en',
ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smsNotifications" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "host_profiles" ADD COLUMN     "billingCurrency" TEXT DEFAULT 'USD',
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payoutAccount" TEXT,
ADD COLUMN     "smsNotifications" BOOLEAN NOT NULL DEFAULT true;
