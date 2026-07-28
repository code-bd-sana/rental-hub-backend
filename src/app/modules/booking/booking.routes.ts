import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';

const router = express.Router();

router.post(
  '/',
  auth('GUEST'),
  validateRequest(BookingValidation.createBookingZodSchema),
  BookingController.createBooking
);

router.get(
  '/my-bookings',
  auth('GUEST'),
  BookingController.getMyBookings
);

router.get(
  '/host-bookings',
  auth('HOST'),
  BookingController.getHostBookings
);

router.get(
  '/:id',
  auth('GUEST', 'HOST'),
  BookingController.getBookingById
);

router.patch(
  '/:id/cancel',
  auth('GUEST'),
  BookingController.cancelBooking
);

router.patch(
  '/:id/status',
  auth('HOST'),
  BookingController.updateBookingStatus
);

export const BookingRoutes = router;
