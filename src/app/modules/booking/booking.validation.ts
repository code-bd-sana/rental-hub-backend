import { z } from 'zod';

export const createBookingZodSchema = z.object({
  body: z.object({
    listingId: z.string().uuid(),
    totalAmount: z.number().min(0),
    depositAmount: z.number().min(0).optional(),
    bookingData: z.any(), // Will contain category-specific booking details
  })
});

export const BookingValidation = {
  createBookingZodSchema,
};
