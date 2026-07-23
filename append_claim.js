  
model ClaimRequest {
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
}
