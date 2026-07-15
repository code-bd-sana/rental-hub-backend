import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ListingController } from './listing.controller';
import { ListingValidation } from './listing.validation';

const router = express.Router();

router.post(
  '/',
  auth('HOST'),
  validateRequest(ListingValidation.createListingZodSchema),
  ListingController.createListing
);

router.get('/my-listings', auth('HOST'), ListingController.getMyListings);

router.get('/', ListingController.getAllListings);
router.get('/:id', ListingController.getListingById);

router.patch(
  '/:id',
  auth('HOST'),
  validateRequest(ListingValidation.updateListingZodSchema),
  ListingController.updateListing
);

router.delete(
  '/:id',
  auth('HOST', 'SUPER_ADMIN'),
  ListingController.deleteListing
);

router.patch(
  '/:id/approve',
  auth('SUPER_ADMIN', 'AGENT'),
  validateRequest(ListingValidation.approveListingZodSchema),
  ListingController.approveListing
);

export const ListingRoutes = router;
