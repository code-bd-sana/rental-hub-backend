import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

router.get(
  '/me',
  auth('SUPER_ADMIN', 'AGENT', 'LOADER', 'HOST', 'GUEST'),
  UserController.getMe
);

router.patch(
  '/me',
  auth('SUPER_ADMIN', 'AGENT', 'LOADER', 'HOST', 'GUEST'),
  UserController.updateMe
);

router.get(
  '/',
  auth('SUPER_ADMIN', 'AGENT'),
  UserController.getAllUsers
);

router.get(
  '/hosts',
  auth('SUPER_ADMIN', 'AGENT'),
  UserController.getAllHosts
);

router.post(
  '/agent',
  auth('SUPER_ADMIN'),
  validateRequest(UserValidation.createAgent),
  UserController.createAgent
);

router.post(
  '/loader',
  auth('SUPER_ADMIN', 'AGENT'),
  validateRequest(UserValidation.createLoader),
  UserController.createLoader
);

router.patch(
  '/host/:id/approve',
  auth('SUPER_ADMIN', 'AGENT'),
  validateRequest(UserValidation.approveHost),
  UserController.approveHost
);

export const UserRoutes = router;
