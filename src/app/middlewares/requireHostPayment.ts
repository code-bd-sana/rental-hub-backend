import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import prisma from '../utils/prisma';
import { PaymentStatus, Role } from '@prisma/client';

export const requireHostPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  // We only enforce this for Hosts. If SUPER_ADMIN is accessing the route, they can bypass.
  if (user?.role === Role.HOST) {
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: user.userId },
      select: { paymentStatus: true, paymentExpiresAt: true }
    });

    if (!hostProfile) {
      throw new AppError(404, 'Host profile not found.');
    }

    if (hostProfile.paymentStatus !== PaymentStatus.PAID) {
      throw new AppError(402, 'Payment Required. Please complete your payment to access the dashboard.');
    }

    if (!hostProfile.paymentExpiresAt || hostProfile.paymentExpiresAt.getTime() < Date.now()) {
      throw new AppError(402, 'Payment Expired. Please renew your 1-month access pass.');
    }
  }

  next();
});
