import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { fileUploadService } from '../../utils/FileUploadService';
import { ClaimService } from './claim.service';

const createClaim = catchAsync(async (req: Request, res: Response) => {
  const { directoryListingId, businessRegistration } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || !files.idCard || !files.proofOfOwnership) {
    throw new Error('idCard and proofOfOwnership files are required');
  }

  // Upload files
  const idCardUrl = await fileUploadService.uploadFile(files.idCard[0], 'claims/documents');
  const proofOfOwnershipUrl = await fileUploadService.uploadFile(files.proofOfOwnership[0], 'claims/documents');

  const payload = {
    directoryListingId,
    businessRegistration,
    idCardUrl,
    proofOfOwnershipUrl,
    userId: req.user!.userId
  };

  const result = await ClaimService.createClaim(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Claim request submitted successfully',
    data: result
  });
});

const getClaims = catchAsync(async (req: Request, res: Response) => {
  const result = await ClaimService.getClaims();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Claims fetched successfully',
    data: result
  });
});

const getMyClaims = catchAsync(async (req: Request, res: Response) => {
  const result = await ClaimService.getMyClaims(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My claims fetched successfully',
    data: result
  });
});

const approveClaim = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ClaimService.approveClaim(id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Claim approved successfully',
    data: result
  });
});

const rejectClaim = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ClaimService.rejectClaim(id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Claim rejected successfully',
    data: result
  });
});

export const ClaimController = {
  createClaim,
  getClaims,
  getMyClaims,
  approveClaim,
  rejectClaim
};
