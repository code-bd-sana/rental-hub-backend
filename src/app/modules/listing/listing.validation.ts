import { z } from 'zod';
import { ListingCategory } from '@prisma/client';

export const createListingZodSchema = z.object({
  body: z.object({
    category: z.nativeEnum(ListingCategory),
    title: z.string().min(3),
    description: z.string().optional(),
    location: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    images: z.array(z.string().url()).optional(),

    // Details based on category
    stayDetails: z.object({
      pricePerNight: z.number().min(0),
      amenities: z.array(z.string()),
    }).optional(),

    carDetails: z.object({
      dailyRate: z.number().min(0),
      carType: z.string(),
      seats: z.number().int().min(1),
      transmission: z.string(),
      doors: z.number().int().optional(),
      bags: z.any().optional(),
      features: z.array(z.string()).optional(),
      includedItems: z.array(z.string()).optional(),
      fuelOptions: z.any().optional(),
      protectionPlans: z.any().optional(),
      extras: z.any().optional(),
      pickupLocations: z.array(z.string()).optional(),
      returnLocations: z.array(z.string()).optional(),
    }).optional(),

    serviceDetails: z.object({
      serviceType: z.string(),
      packages: z.array(z.object({
        name: z.string(),
        price: z.number().min(0)
      }))
    }).optional(),
  }).refine((data) => {
    if (data.category === ListingCategory.STAY && !data.stayDetails) return false;
    if (data.category === ListingCategory.CAR && !data.carDetails) return false;
    if (data.category === ListingCategory.SERVICE && !data.serviceDetails) return false;
    return true;
  }, {
    message: "Missing category-specific details",
  })
});

const approveListingZodSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
  }),
});

export const ListingValidation = {
  createListingZodSchema,
  approveListingZodSchema,
};
