import { Router } from 'express';

import auth from '../../middlewares/auth';
import upload from '../../middlewares/upload';
import validateRequest from '../../middlewares/validateRequest';
import { ListingController } from './listing.controller';
import { ListingValidation } from './listing.validation';

const router = Router();

// Public routes
router.get('/', ListingController.getAllListings);

// Host routes (must be before /:id to avoid route conflict)
router.get('/my-listings', auth('HOST', 'ADMIN'), ListingController.getMyListings);

// Public: single listing
router.get('/:id', ListingController.getListingById);

router.post(
  '/',
  auth('HOST', 'ADMIN'),
  upload.array('images', 10),
  ListingController.createListing
);

router.patch(
  '/:id',
  auth('HOST', 'ADMIN'),
  upload.array('images', 10),
  ListingController.updateListing
);

router.delete('/:id', auth('HOST', 'ADMIN'), ListingController.deleteListing);

// Admin only
router.patch(
  '/:id/toggle-status',
  auth('ADMIN'),
  validateRequest(ListingValidation.toggleStatus),
  ListingController.toggleListingStatus
);

export const ListingRoutes = router;
