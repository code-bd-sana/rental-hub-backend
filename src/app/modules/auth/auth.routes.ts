import { Role } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { fileUploadMiddleware } from '../../middlewares/fileUpload';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post(
  '/register/guest',
  validateRequest(AuthValidation.registerGuest),
  AuthController.registerGuest
);

// We intercept multipart/form-data with fileUploadMiddleware.array('documents')
router.post(
  '/register/host',
  fileUploadMiddleware.array('documents', 10), // Limit to 10 files
  validateRequest(AuthValidation.registerHost),
  AuthController.registerHost
);

router.post(
  '/login',
  validateRequest(AuthValidation.login),
  AuthController.login
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshToken),
  AuthController.refreshToken
);

router.post(
  '/change-password',
  auth(Role.SUPER_ADMIN, Role.AGENT, Role.LOADER, Role.HOST, Role.GUEST),
  validateRequest(AuthValidation.changePassword),
  AuthController.changePassword
);

router.post(
  '/forgot-password',
  validateRequest(AuthValidation.forgotPassword),
  AuthController.forgotPassword
);

router.post(
  '/verify-reset-code',
  validateRequest(AuthValidation.verifyResetCode),
  AuthController.verifyResetCode
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPassword),
  AuthController.resetPassword
);

export const AuthRoutes = router;
