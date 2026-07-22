import express from 'express';
import { ClaimController } from './claim.controller';
import auth from '../../middlewares/auth';
import { fileUploadMiddleware } from '../../middlewares/fileUpload';

const router = express.Router();

router.post(
  '/',
  auth(), // Anyone logged in can claim
  fileUploadMiddleware.fields([
    { name: 'idCard', maxCount: 1 },
    { name: 'proofOfOwnership', maxCount: 1 }
  ]),
  ClaimController.createClaim
);

router.get(
  '/',
  auth(), // Add specific roles later if needed (e.g. Admin)
  ClaimController.getClaims
);

router.patch(
  '/:id/approve',
  auth(), // Add specific roles later if needed (e.g. Admin)
  ClaimController.approveClaim
);

export const ClaimRoutes = router;
