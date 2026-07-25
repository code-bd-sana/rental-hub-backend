import { Listing, Prisma, Role } from '@prisma/client';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import { deleteFromS3 } from '../../utils/s3.utils';

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

  const isPaid = host.paymentStatus === 'PAID';
  const expiresAt = host.paymentExpiresAt ? new Date(host.paymentExpiresAt) : null;
  const isExpired = expiresAt ? expiresAt < new Date() : true;

  if (!isPaid || isExpired) {
    throw new AppError(403, 'You must have an active subscription to add a listing.');
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
        country: payload.country
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
    } else if (payload.category === 'FOOD') {
      const { items, ...foodData } = payload.foodDetails;
      const foodDetails = await tx.foodDetails.create({
        data: {
          listingId: listing.id,
          ...foodData
        }
      });

      if (items && items.length > 0) {
        await tx.foodItem.createMany({
          data: items.map((item: any) => ({
            foodDetailsId: foodDetails.id,
            ...item
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

  const where: any = {};

  if (status !== 'ALL') {
    where.approvalStatus = status || 'APPROVED';
  }

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
      },
      foodDetails: {
        include: { items: true }
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
      foodDetails: {
        include: {
          items: true
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

const getMyListings = async (hostId: string) => {
  const listings = await prisma.listing.findMany({
    where: { hostId },
    include: {
      images: {
        where: { isHero: true }
      },
      stayDetails: true,
      carDetails: true,
      serviceDetails: {
        include: { packages: true }
      },
      foodDetails: {
        include: { items: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return listings;
};

const updateListing = async (listingId: string, hostId: string, payload: any) => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      images: true,
      serviceDetails: { include: { packages: true } },
      foodDetails: { include: { items: true } }
    }
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  if (listing.hostId !== hostId) {
    throw new AppError(403, 'You are not authorized to update this listing');
  }

  const host = await prisma.hostProfile.findUnique({
    where: { id: hostId }
  });

  if (!host) {
    throw new AppError(404, 'Host profile not found');
  }

  const isPaid = host.paymentStatus === 'PAID';
  const expiresAt = host.paymentExpiresAt ? new Date(host.paymentExpiresAt) : null;
  const isExpired = expiresAt ? expiresAt < new Date() : true;

  if (!isPaid || isExpired) {
    throw new AppError(403, 'You must have an active subscription to update a listing.');
  }

  const s3ImagesToDelete: string[] = [];

  // Check main images
  if (payload.images && listing.images) {
    const newImageUrls = payload.images;
    const existingImageUrls = listing.images.map((img) => img.url);
    const removedImages = existingImageUrls.filter((url) => !newImageUrls.includes(url));
    s3ImagesToDelete.push(...removedImages);
  }

  // Check Service Packages images
  if (payload.serviceDetails?.packages && listing.serviceDetails?.packages) {
    const newPackageImages = payload.serviceDetails.packages
      .map((pkg: any) => pkg.imageUrl)
      .filter(Boolean) as string[];
    const existingPackageImages = listing.serviceDetails.packages
      .map((pkg) => pkg.imageUrl)
      .filter(Boolean) as string[];
    const removedPkgImages = existingPackageImages.filter((url) => !newPackageImages.includes(url));
    s3ImagesToDelete.push(...removedPkgImages);
  }

  // Check Food Items images
  if (payload.foodDetails?.items && listing.foodDetails?.items) {
    const newItemImages = payload.foodDetails.items
      .map((item: any) => item.imageUrl)
      .filter(Boolean) as string[];
    const existingItemImages = listing.foodDetails.items
      .map((item) => item.imageUrl)
      .filter(Boolean) as string[];
    const removedItemImages = existingItemImages.filter((url) => !newItemImages.includes(url));
    s3ImagesToDelete.push(...removedItemImages);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedListing = await tx.listing.update({
      where: { id: listingId },
      data: {
        title: payload.title,
        description: payload.description,
        location: payload.location,
        city: payload.city,
        country: payload.country
      }
    });

    if (payload.images) {
      await tx.listingImage.deleteMany({ where: { listingId } });
      if (payload.images.length > 0) {
        await tx.listingImage.createMany({
          data: payload.images.map((url: string, index: number) => ({
            listingId,
            url,
            isHero: index === 0
          }))
        });
      }
    }

    if (payload.stayDetails && listing.category === 'STAY') {
      await tx.stayDetails.update({
        where: { listingId },
        data: payload.stayDetails
      });
    }

    if (payload.carDetails && listing.category === 'CAR') {
      await tx.carDetails.update({
        where: { listingId },
        data: payload.carDetails
      });
    }

    if (payload.serviceDetails && listing.category === 'SERVICE') {
      const { packages, ...serviceData } = payload.serviceDetails;
      const updatedService = await tx.serviceDetails.update({
        where: { listingId },
        data: serviceData
      });

      if (packages) {
        await tx.servicePackage.deleteMany({
          where: { serviceDetailsId: updatedService.id }
        });
        await tx.servicePackage.createMany({
          data: packages.map((pkg: any) => ({
            serviceDetailsId: updatedService.id,
            ...pkg
          }))
        });
      }
    }

    if (payload.foodDetails && listing.category === 'FOOD') {
      const { items, ...foodData } = payload.foodDetails;
      const updatedFood = await tx.foodDetails.update({
        where: { listingId },
        data: foodData
      });

      if (items) {
        await tx.foodItem.deleteMany({
          where: { foodDetailsId: updatedFood.id }
        });
        await tx.foodItem.createMany({
          data: items.map((item: any) => ({
            foodDetailsId: updatedFood.id,
            ...item
          }))
        });
      }
    }

    return updatedListing;
  });

  // After successful DB transaction, delete orphaned images from S3
  if (s3ImagesToDelete.length > 0) {
    await Promise.allSettled(s3ImagesToDelete.map((url) => deleteFromS3(url)));
  }

  return await getListingById(result.id);
};

const deleteListing = async (listingId: string, hostId: string, userRole?: string) => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      images: true,
      serviceDetails: { include: { packages: true } },
      foodDetails: { include: { items: true } }
    }
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  // Bypass hostId check if the user is a SUPER_ADMIN
  if (userRole !== Role.SUPER_ADMIN && listing.hostId !== hostId) {
    throw new AppError(403, 'You are not authorized to delete this listing');
  }

  // Collect all associated S3 images to delete
  const imagesToDelete: string[] = [];

  if (listing.images && listing.images.length > 0) {
    imagesToDelete.push(...listing.images.map((img) => img.url));
  }

  if (listing.serviceDetails && listing.serviceDetails.packages) {
    const pkgImages = listing.serviceDetails.packages
      .filter((pkg) => pkg.imageUrl)
      .map((pkg) => pkg.imageUrl as string);
    imagesToDelete.push(...pkgImages);
  }

  if (listing.foodDetails && listing.foodDetails.items) {
    const itemImages = listing.foodDetails.items
      .filter((item) => item.imageUrl)
      .map((item) => item.imageUrl as string);
    imagesToDelete.push(...itemImages);
  }

  // Delete all collected images from S3 concurrently
  if (imagesToDelete.length > 0) {
    await Promise.allSettled(imagesToDelete.map((url) => deleteFromS3(url)));
  }

  await prisma.listing.delete({
    where: { id: listingId }
  });

  return null;
};

export const ListingService = {
  createListing,
  getAllListings,
  getListingById,
  approveListing,
  getMyListings,
  updateListing,
  deleteListing
};
