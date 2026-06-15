import type { RequestHandler } from 'express';

import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import type { IListingQuery } from './listing.interface';
import { ListingService } from './listing.service';

const createListing: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  // Parse body from multipart form data (JSON string in 'data' field)
  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;
  const files = req.files as Express.Multer.File[] | undefined;

  const result = await ListingService.createListing(req.user.userId, payload, files);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Listing created successfully.',
    data: result
  });
});

const getAllListings: RequestHandler = catchAsync(async (req, res) => {
  const result = await ListingService.getAllListings(req.query as unknown as IListingQuery);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listings retrieved successfully.',
    meta: result.meta,
    data: result.data
  });
});

const getListingById: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ListingService.getListingById(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing retrieved successfully.',
    data: result
  });
});

const getMyListings: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  const result = await ListingService.getMyListings(
    req.user.userId,
    req.query as unknown as IListingQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your listings retrieved successfully.',
    meta: result.meta,
    data: result.data
  });
});

const updateListing: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  const { id } = req.params;
  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;
  const files = req.files as Express.Multer.File[] | undefined;

  const result = await ListingService.updateListing(
    id as string,
    req.user.userId,
    req.user.role,
    payload,
    files
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing updated successfully.',
    data: result
  });
});

const deleteListing: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  const { id } = req.params;
  await ListingService.deleteListing(id as string, req.user.userId, req.user.role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing deleted successfully.',
    data: null
  });
});

const toggleListingStatus: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ListingService.toggleListingStatus(id as string, req.body.isActive);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Listing ${req.body.isActive ? 'activated' : 'deactivated'} successfully.`,
    data: result
  });
});

export const ListingController = {
  createListing,
  getAllListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
  toggleListingStatus
};
