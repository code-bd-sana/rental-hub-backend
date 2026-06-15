import { z } from 'zod';

const listingCategories = ['STAYS', 'CARS', 'FOOD', 'SALON', 'BARBER', 'SPA'] as const;

// Category-specific attribute schemas
const staysAttributes = z
  .object({
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    maxGuests: z.number().optional(),
    hasWifi: z.boolean().optional(),
    hasParking: z.boolean().optional(),
    amenities: z.array(z.string()).optional()
  })
  .optional();

const carsAttributes = z
  .object({
    brand: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
    seats: z.number().optional(),
    transmission: z.enum(['AUTOMATIC', 'MANUAL']).optional(),
    fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']).optional()
  })
  .optional();

const foodAttributes = z
  .object({
    cuisine: z.string().optional(),
    mealType: z.string().optional(),
    servingSize: z.string().optional(),
    isVegetarian: z.boolean().optional()
  })
  .optional();

const serviceAttributes = z
  .object({
    services: z.array(z.string()).optional(),
    specialties: z.array(z.string()).optional(),
    acceptsWalkIns: z.boolean().optional()
  })
  .optional();

const spaAttributes = z
  .object({
    treatments: z.array(z.string()).optional(),
    duration: z.number().optional(),
    packageType: z.string().optional()
  })
  .optional();

const createListing = z.object({
  body: z
    .object({
      title: z
        .string({ message: 'Title is required.' })
        .min(3, 'Title must be at least 3 characters long.')
        .max(200, 'Title must not exceed 200 characters.'),
      description: z
        .string({ message: 'Description is required.' })
        .min(10, 'Description must be at least 10 characters long.')
        .max(5000, 'Description must not exceed 5000 characters.'),
      category: z.enum(listingCategories, {
        message: 'Invalid category. Must be one of: STAYS, CARS, FOOD, SALON, BARBER, SPA.'
      }),
      price: z
        .number({ message: 'Price is required.' })
        .positive('Price must be a positive number.'),
      location: z.string().max(200, 'Location must not exceed 200 characters.').optional(),
      attributes: z.union([
        staysAttributes,
        carsAttributes,
        foodAttributes,
        serviceAttributes,
        spaAttributes
      ]).optional(),
      teamId: z.string().optional()
    })
    .strict()
});

const updateListing = z.object({
  body: z
    .object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters long.')
        .max(200, 'Title must not exceed 200 characters.')
        .optional(),
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters long.')
        .max(5000, 'Description must not exceed 5000 characters.')
        .optional(),
      price: z
        .number()
        .positive('Price must be a positive number.')
        .optional(),
      location: z.string().max(200).optional(),
      attributes: z.record(z.string(), z.unknown()).optional(),
      isActive: z.boolean().optional()
    })
    .strict()
});

const toggleStatus = z.object({
  body: z
    .object({
      isActive: z.boolean({ message: 'isActive is required.' })
    })
    .strict()
});

export const ListingValidation = {
  createListing,
  updateListing,
  toggleStatus
};
