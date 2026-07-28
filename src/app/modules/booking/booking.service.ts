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

const getBookingById = async (id: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      listing: {
        select: { title: true, category: true, location: true, address: true, images: { take: 1 } }
      }
    }
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  // Ensure user owns booking or listing
  const guest = await prisma.guestProfile.findUnique({ where: { userId } });
  const host = await prisma.hostProfile.findUnique({ where: { userId } });

  const isGuestOwner = guest && booking.guestId === guest.id;
  const isHostOwner = host && booking.listing.hostId === host.id;

  if (!isGuestOwner && !isHostOwner) {
    throw new AppError(403, 'You are not authorized to view this booking');
  }

  return booking;
};

const cancelBooking = async (id: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id }
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  // Ensure user owns booking
  const guest = await prisma.guestProfile.findUnique({ where: { userId } });

  if (!guest || booking.guestId !== guest.id) {
    throw new AppError(403, 'You are not authorized to cancel this booking');
  }

  if (booking.status === 'CANCELLED') {
    throw new AppError(400, 'Booking is already cancelled');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' }
  });

  return updatedBooking;
};

const updateBookingStatus = async (id: string, userId: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      listing: true
    }
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  // Ensure user is the host of the listing
  const host = await prisma.hostProfile.findUnique({ where: { userId } });

  if (!host || booking.listing.hostId !== host.id) {
    throw new AppError(403, 'You are not authorized to update this booking');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { status }
  });

  return updatedBooking;
};

export const BookingService = {
  createBooking,
  getMyBookings,
  getHostBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus
};
