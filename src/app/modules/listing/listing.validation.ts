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
      availableTimeSlots: z.array(z.string()).optional(),
      packages: z.array(z.object({
        name: z.string(),
        price: z.number().min(0),
        imageUrl: z.string().url().optional().or(z.literal(''))
      }))
    }).optional(),

    foodDetails: z.object({
      items: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number().min(0),
        imageUrl: z.string().url().optional().or(z.literal('')),
      }))
    }).optional(),
  }).refine((data) => {
    if (data.category === ListingCategory.STAY && !data.stayDetails) return false;
    if (data.category === ListingCategory.CAR && !data.carDetails) return false;
    if (data.category === ListingCategory.SERVICE && !data.serviceDetails) return false;
    if (data.category === ListingCategory.FOOD && !data.foodDetails) return false;
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

const updateListingZodSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    images: z.array(z.string().url()).optional(),

    stayDetails: z.object({
      pricePerNight: z.number().min(0).optional(),
      amenities: z.array(z.string()).optional(),
    }).optional(),

    carDetails: z.object({
      dailyRate: z.number().min(0).optional(),
      carType: z.string().optional(),
      seats: z.number().int().min(1).optional(),
      transmission: z.string().optional(),
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
      serviceType: z.string().optional(),
      availableTimeSlots: z.array(z.string()).optional(),
      packages: z.array(z.object({
        name: z.string(),
        price: z.number().min(0),
        imageUrl: z.string().url().optional().or(z.literal(''))
      })).optional()
    }).optional(),

    foodDetails: z.object({
      items: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number().min(0),
        imageUrl: z.string().url().optional().or(z.literal('')),
      })).optional()
    }).optional(),
  })
});

export const ListingValidation = {
  createListingZodSchema,
  updateListingZodSchema,
  approveListingZodSchema,
};
