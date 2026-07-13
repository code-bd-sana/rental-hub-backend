import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import prisma from '../../utils/prisma';
import { ListingService } from './listing.service';

const createListing = catchAsync(async (req: Request, res: Response) => {
  // Assume req.user is set by auth middleware, and host profile is linked
  const user = (req as any).user;
  
  // Need to find hostId for this user. We assume it's passed or fetched.
  // For safety, let's fetch it if not provided in body (or just require the user to have a hostProfile).
  const hostProfile = await prisma.hostProfile.findUnique({
    where: { userId: user.id }
  });
  
  if (!hostProfile) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'You do not have a host profile',
      data: null,
    });
  }

  const result = await ListingService.createListing(hostProfile.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Listing created successfully',
    data: result,
  });
});

const getAllListings = catchAsync(async (req: Request, res: Response) => {
  const result = await ListingService.getAllListings(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listings fetched successfully',
    data: result,
  });
});

const getListingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ListingService.getListingById(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing fetched successfully',
    data: result,
  });
});

const approveListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await ListingService.approveListing(id as string, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Listing status updated to ${status} successfully`,
    data: result,
  });
});

export const ListingController = {
  createListing,
  getAllListings,
  getListingById,
  approveListing,
};
