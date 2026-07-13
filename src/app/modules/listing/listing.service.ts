import { Listing, Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';

const createListing = async (hostId: string, payload: any) => {
  // First, verify the host profile exists
  const host = await prisma.hostProfile.findUnique({
    where: { id: hostId }
  });

  if (!host) {
    throw new AppError(404, 'Host profile not found');
  }

  if (host.approvalStatus !== 'APPROVED') {
    throw new AppError(403, 'Your host profile is not approved yet.');
  }

  // Create listing within a transaction to ensure all relations are created
  const result = await prisma.$transaction(async (tx) => {
    const listing = await tx.listing.create({
      data: {
        hostId,
        category: payload.category,
        title: payload.title,
        description: payload.description,
        location: payload.location,
        city: payload.city,
        country: payload.country,
      }
    });

    if (payload.images && payload.images.length > 0) {
      await tx.listingImage.createMany({
        data: payload.images.map((url: string, index: number) => ({
          listingId: listing.id,
          url,
          isHero: index === 0
        }))
      });
    }

    if (payload.category === 'STAY') {
      await tx.stayDetails.create({
        data: {
          listingId: listing.id,
          ...payload.stayDetails
        }
      });
    } else if (payload.category === 'CAR') {
      await tx.carDetails.create({
        data: {
          listingId: listing.id,
          ...payload.carDetails
        }
      });
    } else if (payload.category === 'SERVICE') {
      const { packages, ...serviceData } = payload.serviceDetails;
      const serviceDetails = await tx.serviceDetails.create({
        data: {
          listingId: listing.id,
          ...serviceData
        }
      });
      
      if (packages && packages.length > 0) {
        await tx.servicePackage.createMany({
          data: packages.map((pkg: any) => ({
            serviceDetailsId: serviceDetails.id,
            ...pkg
          }))
        });
      }
    }

    return listing;
  });

  // Fetch the created listing with details
  return await getListingById(result.id);
};

const getAllListings = async (query: any) => {
  const { category, city, country, status } = query;

  const where: any = {
    // Only show APPROVED listings publicly by default, unless status query specifies otherwise
    // Note: In a real app, only ADMINs should be able to pass status=PENDING/etc.
    approvalStatus: status || 'APPROVED',
  };

  if (category) where.category = category;
  if (city) where.city = city;
  if (country) where.country = country;

  const listings = await prisma.listing.findMany({
    where,
    include: {
      images: {
        where: { isHero: true }
      },
      stayDetails: true,
      carDetails: true,
      serviceDetails: {
        include: { packages: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return listings;
};

const getListingById = async (id: string) => {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: true,
      stayDetails: true,
      carDetails: true,
      serviceDetails: {
        include: {
          packages: true
        }
      },
      host: {
        include: {
          user: {
            select: { name: true, email: true, phone: true }
          }
        }
      }
    }
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  return listing;
};

const approveListing = async (listingId: string, status: any) => {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: { approvalStatus: status }
  });

  return updatedListing;
};

export const ListingService = {
  createListing,
  getAllListings,
  getListingById,
  approveListing,
};
