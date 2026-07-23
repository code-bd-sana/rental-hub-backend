import { Role } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ListingController } from './listing.controller';
import { ListingValidation } from './listing.validation';

import { requireHostPayment } from '../../middlewares/requireHostPayment';

const router = express.Router();

router.post(
  '/',
  auth(Role.HOST),
  requireHostPayment,
  validateRequest(ListingValidation.createListingZodSchema),
  ListingController.createListing
);

router.get('/my-listings', auth(Role.HOST), requireHostPayment, ListingController.getMyListings);

router.get('/', ListingController.getAllListings);
router.get('/:id', ListingController.getListingById);

router.patch(
  '/:id',
  auth(Role.HOST),
  requireHostPayment,
  validateRequest(ListingValidation.updateListingZodSchema),
  ListingController.updateListing
);

router.delete(
  '/:id',
  auth(Role.HOST, Role.SUPER_ADMIN),
  requireHostPayment,
  ListingController.deleteListing
);

router.patch(
  '/:id/approve',
  auth(Role.SUPER_ADMIN, Role.AGENT),
  validateRequest(ListingValidation.approveListingZodSchema),
  ListingController.approveListing
);

export const ListingRoutes = router;
