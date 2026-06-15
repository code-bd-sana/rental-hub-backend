import type { Prisma } from '@prisma/client';

import AppError from '../../errors/AppError';
import { uploadToCloudinary } from '../../utils/cloudinary';
import prisma from '../../utils/prisma';
import type { ICreateListingPayload, IListingQuery, IUpdateListingPayload } from './listing.interface';

const listingSelect = {
  id: true,
  title: true,
  description: true,
  category: true,
  price: true,
  location: true,
  images: true,
  isActive: true,
  attributes: true,
  hostId: true,
  host: {
    select: { id: true, name: true, email: true }
  },
  teamId: true,
  team: {
    select: { id: true, name: true }
  },
  createdAt: true,
  updatedAt: true
};

const createListing = async (
  hostId: string,
  payload: ICreateListingPayload,
  files?: Express.Multer.File[]
) => {
  // Upload images to Cloudinary if provided
  const imageUrls: string[] = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const url = await uploadToCloudinary(file.buffer, 'rentals-hub/listings');
      imageUrls.push(url);
    }
  }

  const listing = await prisma.listing.create({
    data: {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      price: payload.price,
      location: payload.location,
      images: imageUrls,
      attributes: (payload.attributes as Prisma.InputJsonValue) ?? undefined,
      hostId,
      teamId: payload.teamId
    },
    select: listingSelect
  });

  return listing;
};

const getAllListings = async (query: IListingQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, any> = {};

  // Search by title or location
  if (query.searchTerm) {
    where.OR = [
      { title: { contains: query.searchTerm, mode: 'insensitive' } },
      { location: { contains: query.searchTerm, mode: 'insensitive' } }
    ];
  }

  // Filter by category
  if (query.category) {
    where.category = query.category;
  }

  // Price range
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = Number(query.minPrice);
    if (query.maxPrice) where.price.lte = Number(query.maxPrice);
  }

  // Filter by location
  if (query.location) {
    where.location = { contains: query.location, mode: 'insensitive' };
  }

  // Filter by active status
  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true';
  }

  // Filter by host
  if (query.hostId) {
    where.hostId = query.hostId;
  }

  // Filter by team
  if (query.teamId) {
    where.teamId = query.teamId;
  }

  // Sorting
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder || 'desc';

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      select: listingSelect,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit
    }),
    prisma.listing.count({ where })
  ]);

  return {
    meta: { total, page, limit },
    data: listings
  };
};

const getListingById = async (id: string) => {
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: listingSelect
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found.');
  }

  return listing;
};

const getMyListings = async (hostId: string, query: IListingQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Record<string, any> = { hostId };

  if (query.category) where.category = query.category;
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder || 'desc';

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      select: listingSelect,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit
    }),
    prisma.listing.count({ where })
  ]);

  return {
    meta: { total, page, limit },
    data: listings
  };
};

const updateListing = async (
  listingId: string,
  userId: string,
  userRole: string,
  payload: IUpdateListingPayload,
  files?: Express.Multer.File[]
) => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId }
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found.');
  }

  // Only the owner or admin can update
  if (listing.hostId !== userId && userRole !== 'ADMIN') {
    throw new AppError(403, 'You can only update your own listings.');
  }

  // Upload new images if provided
  let imageUrls: string[] | undefined;
  if (files && files.length > 0) {
    imageUrls = [...listing.images]; // Keep existing images
    for (const file of files) {
      const url = await uploadToCloudinary(file.buffer, 'rentals-hub/listings');
      imageUrls.push(url);
    }
  }

  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: {
      ...(payload.title && { title: payload.title }),
      ...(payload.description && { description: payload.description }),
      ...(payload.price !== undefined && { price: payload.price }),
      ...(payload.location !== undefined && { location: payload.location }),
      ...(payload.attributes !== undefined && { attributes: payload.attributes as Prisma.InputJsonValue }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
      ...(imageUrls && { images: imageUrls })
    },
    select: listingSelect
  });

  return updatedListing;
};

const deleteListing = async (listingId: string, userId: string, userRole: string) => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId }
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found.');
  }

  // Only the owner or admin can delete
  if (listing.hostId !== userId && userRole !== 'ADMIN') {
    throw new AppError(403, 'You can only delete your own listings.');
  }

  await prisma.listing.delete({
    where: { id: listingId }
  });

  return null;
};

// Admin only: Toggle listing active status
const toggleListingStatus = async (listingId: string, isActive: boolean) => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId }
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found.');
  }

  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: { isActive },
    select: listingSelect
  });

  return updatedListing;
};

export const ListingService = {
  createListing,
  getAllListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
  toggleListingStatus
};
