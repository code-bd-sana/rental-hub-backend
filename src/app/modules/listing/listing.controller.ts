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
    where: { userId: user.userId }
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
  let isSubscribed = false;
  
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const jwt = require('jsonwebtoken');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const config = require('../../config').default;
      const decoded = jwt.verify(token, config.jwt.accessSecret) as any;
      
      if (['SUPER_ADMIN', 'AGENT', 'HOST'].includes(decoded.role)) {
        isSubscribed = true;
      } else if (decoded.role === 'GUEST') {
        const guest = await prisma.guestProfile.findUnique({ where: { userId: decoded.userId } });
        if (guest?.subscriptionStatus) {
          isSubscribed = true;
        }
      }
    } catch (e) {
      // invalid token, ignore
    }
  }

  const result = await ListingService.getAllListings({ ...req.query, isSubscribed });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listings fetched successfully',
    meta: result.meta,
    data: result.data,
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

const getMyListings = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const hostProfile = await prisma.hostProfile.findUnique({ where: { userId: user.userId } });
  
  if (!hostProfile) {
    return sendResponse(res, { statusCode: 404, success: false, message: 'Host profile not found', data: null });
  }

  const result = await ListingService.getMyListings(hostProfile.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My listings fetched successfully',
    data: result,
  });
});

const updateListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const hostProfile = await prisma.hostProfile.findUnique({ where: { userId: user.userId } });
  
  if (!hostProfile) {
    return sendResponse(res, { statusCode: 404, success: false, message: 'Host profile not found', data: null });
  }

  const result = await ListingService.updateListing(id as string, hostProfile.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing updated successfully',
    data: result,
  });
});

const deleteListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  
  let hostId = '';
  if (user.role === 'HOST') {
    const hostProfile = await prisma.hostProfile.findUnique({ where: { userId: user.userId } });
    if (!hostProfile) {
      return sendResponse(res, { statusCode: 404, success: false, message: 'Host profile not found', data: null });
    }
    hostId = hostProfile.id;
  }
  
  const result = await ListingService.deleteListing(id as string, hostId, user.role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing deleted successfully',
    data: result,
  });
});

export const ListingController = {
  createListing,
  getAllListings,
  getListingById,
  approveListing,
  getMyListings,
  updateListing,
  deleteListing,
};
