import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { PaymentService } from './payment.service';
import sendResponse from '../../utils/sendResponse';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';

const createHostPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId; 
  const email = req.user?.email;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const hostProfile = await prisma.hostProfile.findUnique({ where: { userId } });
  if (!hostProfile) {
    throw new AppError(404, 'Host profile not found');
  }

  const session = await PaymentService.createHostPaymentSession(hostProfile.id, email!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment session created successfully',
    data: {
      url: session.url
    },
  });
});

const createGuestSubscriptionSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const email = req.user?.email;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const guestProfile = await prisma.guestProfile.findUnique({ where: { userId } });
  if (!guestProfile) {
    throw new AppError(404, 'Guest profile not found');
  }

  const session = await PaymentService.createGuestSubscriptionSession(guestProfile.id, email!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscription session created successfully',
    data: {
      url: session.url
    },
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const result = await PaymentService.handleWebhook(req.body, signature);
  res.status(200).json(result);
});

export const PaymentController = {
  createHostPaymentSession,
  createGuestSubscriptionSession,
  handleWebhook
};
