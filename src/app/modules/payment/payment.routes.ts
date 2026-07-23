import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/create-host-payment',
  auth(Role.HOST),
  PaymentController.createHostPaymentSession
);

router.post(
  '/create-guest-subscription',
  auth(Role.GUEST),
  PaymentController.createGuestSubscriptionSession
);

// Note: webhook route needs raw body parser, which should be configured in app.ts before JSON parser
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

export const PaymentRoutes = router;
