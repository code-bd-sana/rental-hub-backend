import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';

const createBooking = async (userId: string, payload: any) => {
  // Find guest profile
  const guest = await prisma.guestProfile.findUnique({
    where: { userId }
  });

  if (!guest) {
    throw new AppError(404, 'Guest profile not found');
  }

  // Find listing to ensure it exists, is active, and is approved
  const listing = await prisma.listing.findUnique({
    where: { 
      id: payload.listingId, 
      isActive: true,
      approvalStatus: 'APPROVED'
    }
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found, inactive, or not approved');
  }

  // Generate 6-digit OTP for booking confirmation
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  const booking = await prisma.booking.create({
    data: {
      guestId: guest.id,
      listingId: listing.id,
      totalAmount: payload.totalAmount,
      depositAmount: payload.depositAmount,
      bookingData: payload.bookingData,
      otpCode
    }
  });

  return booking;
};

const getMyBookings = async (userId: string) => {
  const guest = await prisma.guestProfile.findUnique({
    where: { userId }
  });

  if (!guest) return [];

  const bookings = await prisma.booking.findMany({
    where: { guestId: guest.id },
    include: {
      listing: {
        select: { title: true, category: true, images: { take: 1 } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return bookings;
};

const getHostBookings = async (userId: string) => {
  const host = await prisma.hostProfile.findUnique({
    where: { userId }
  });

  if (!host) return [];

  const bookings = await prisma.booking.findMany({
    where: { 
      listing: {
        hostId: host.id
      }
    },
    include: {
      guest: {
        include: { user: { select: { name: true, email: true, phone: true } } }
      },
      listing: {
        select: { title: true, category: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return bookings;
};

export const BookingService = {
  createBooking,
  getMyBookings,
  getHostBookings
};
