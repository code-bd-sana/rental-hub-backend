import prisma from '../../utils/prisma';
import { ClaimStatus, DirectoryStatus } from '@prisma/client';

interface CreateClaimPayload {
  directoryListingId: string;
  userId: string;
  idCardUrl: string;
  proofOfOwnershipUrl: string;
  businessRegistration: string;
}

const createClaim = async (payload: CreateClaimPayload) => {
  return await prisma.claimRequest.create({
    data: payload
  });
};

const getClaims = async () => {
  return await prisma.claimRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      directoryListing: true,
      user: {
        select: { name: true, email: true }
      }
    }
  });
};

const approveClaim = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Get the claim
    const claim = await tx.claimRequest.findUnique({ where: { id } });
    if (!claim) {
      throw new Error('Claim request not found');
    }
    if (claim.status !== ClaimStatus.PENDING) {
      throw new Error('Only pending claims can be approved');
    }

    // 2. Update this claim to APPROVED
    const approvedClaim = await tx.claimRequest.update({
      where: { id },
      data: { status: ClaimStatus.APPROVED }
    });

    // 3. Update the directory listing status to CLAIMED
    await tx.directoryListing.update({
      where: { id: claim.directoryListingId },
      data: { status: DirectoryStatus.CLAIMED }
    });

    // 4. Reject all other pending claims for this directory
    await tx.claimRequest.updateMany({
      where: {
        directoryListingId: claim.directoryListingId,
        id: { not: id },
        status: ClaimStatus.PENDING
      },
      data: { status: ClaimStatus.REJECTED }
    });

    return approvedClaim;
  });
};

const rejectClaim = async (id: string) => {
  return await prisma.claimRequest.update({
    where: { id },
    data: { status: ClaimStatus.REJECTED }
  });
};

export const ClaimService = {
  createClaim,
  getClaims,
  approveClaim,
  rejectClaim
};
