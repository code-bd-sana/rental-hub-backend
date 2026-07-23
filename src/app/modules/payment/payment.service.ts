import Stripe from 'stripe';
import config from '../../config';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import { PaymentStatus } from '@prisma/client';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-01-27.acacia' as any, // Bypass strict type check for apiVersion
});

const getFrontendUrl = () => {
  return config.corsOrigin === '*' ? 'http://localhost:3000' : config.corsOrigin;
};

const createHostPaymentSession = async (hostId: string, email: string) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: email,
    line_items: [
      {
        price: config.stripe.hostSubscriptionPriceId,
        quantity: 1,
      },
    ],
    metadata: {
      hostId,
      type: 'HOST_ONBOARDING_FEE'
    },
    success_url: `${getFrontendUrl()}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getFrontendUrl()}/dashboard/payment-cancel`,
  });

  return session;
};

const createGuestSubscriptionSession = async (guestId: string, email: string) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    line_items: [
      {
        price: config.stripe.guestSubscriptionPriceId,
        quantity: 1,
      },
    ],
    metadata: {
      guestId,
      type: 'GUEST_DIRECTORY_SUBSCRIPTION'
    },
    success_url: `${getFrontendUrl()}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getFrontendUrl()}/directory`,
  });

  return session;
};

const handleWebhook = async (body: any, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripe.webhookSecret
    );
  } catch (err: any) {
    throw new AppError(400, `Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.metadata?.type === 'HOST_ONBOARDING_FEE') {
        const hostId = session.metadata.hostId;
        const now = new Date();
        const expiresAt = new Date(now.setMonth(now.getMonth() + 1));
        
        await prisma.hostProfile.update({
          where: { id: hostId },
          data: { 
            paymentStatus: PaymentStatus.PAID,
            paymentExpiresAt: expiresAt,
            stripeCustomerId: session.customer as string
          }
        });
      } else if (session.metadata?.type === 'GUEST_DIRECTORY_SUBSCRIPTION') {
        const guestId = session.metadata.guestId;
        await prisma.guestProfile.update({
          where: { id: guestId },
          data: {
            subscriptionStatus: true,
            stripeCustomerId: session.customer as string
          }
        });
      }
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.guestProfile.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: { subscriptionStatus: false }
      });
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { received: true };
};

export const PaymentService = {
  createHostPaymentSession,
  createGuestSubscriptionSession,
  handleWebhook
};
