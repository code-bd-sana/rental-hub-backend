const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Add fields to Listing
const listingFind = `createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("listings")`;

const listingReplace = `createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  claimedStatus ClaimStatus @default(UNCLAIMED)
  claimRequests ClaimRequest[]

  @@map("listings")`;

content = content.replace(listingFind, listingReplace);

// Add fields to GuestProfile
const guestFind = `subscriptionStatus Boolean  @default(false)`;
const guestReplace = `subscriptionStatus Boolean  @default(false)\n  stripeCustomerId   String?`;
content = content.replace(guestFind, guestReplace);

// Append ClaimRequest model
if (!content.includes('model ClaimRequest')) {
  content += `\nmodel ClaimRequest {
  id          String      @id @default(uuid())
  listingId   String
  listing     Listing     @relation(fields: [listingId], references: [id], onDelete: Cascade)
  hostId      String
  host        HostProfile @relation(fields: [hostId], references: [id], onDelete: Cascade)
  
  businessName String?
  documents    Json? 
  
  status      ClaimStatus @default(PENDING_APPROVAL)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("claim_requests")
}\n`;
}

fs.writeFileSync(schemaPath, content);
console.log('Schema updated successfully!');
