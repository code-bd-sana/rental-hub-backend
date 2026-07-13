import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { BookingService } from './booking.service';
import sendResponse from '../../utils/sendResponse';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  const result = await BookingService.createBooking(user.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await BookingService.getMyBookings(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bookings fetched successfully',
    data: result,
  });
});

const getHostBookings = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await BookingService.getHostBookings(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Host bookings fetched successfully',
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  getHostBookings,
};
