const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Add PaymentStatus enum
if (!content.includes('enum PaymentStatus')) {
  content = content.replace('model HostProfile {', 'enum PaymentStatus {\n  UNPAID\n  PAID\n}\n\nmodel HostProfile {');
}

// Add fields to HostProfile
const hostFind = `createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("host_profiles")`;
const hostReplace = `createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  stripeCustomerId String?
  paymentStatus    PaymentStatus @default(UNPAID)

  @@map("host_profiles")`;
content = content.replace(hostFind, hostReplace);

// Add field to GuestProfile
const guestFind = `subscriptionStatus Boolean  @default(false)`;
const guestReplace = `subscriptionStatus Boolean  @default(false)\n  stripeCustomerId   String?`;
content = content.replace(guestFind, guestReplace);

fs.writeFileSync(schemaPath, content);
console.log('Schema updated successfully!');
