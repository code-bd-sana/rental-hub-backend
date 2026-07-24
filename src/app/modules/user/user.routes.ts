import { Role } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

router.get(
  '/me',
  auth(Role.SUPER_ADMIN, Role.AGENT, Role.LOADER, Role.HOST, Role.GUEST),
  UserController.getMe
);

router.patch(
  '/me',
  auth(Role.SUPER_ADMIN, Role.AGENT, Role.LOADER, Role.HOST, Role.GUEST),
  UserController.updateMe
);

router.get(
  '/',
  auth(Role.SUPER_ADMIN, Role.AGENT),
  UserController.getAllUsers
);

router.get(
  '/hosts',
  auth(Role.SUPER_ADMIN, Role.AGENT),
  UserController.getAllHosts
);

router.post(
  '/agent',
  auth(Role.SUPER_ADMIN),
  validateRequest(UserValidation.createAgent),
  UserController.createAgent
);

router.post(
  '/loader',
  auth(Role.SUPER_ADMIN, Role.AGENT),
  validateRequest(UserValidation.createLoader),
  UserController.createLoader
);

router.patch(
  '/host/:id/approve',
  auth(Role.SUPER_ADMIN, Role.AGENT),
  validateRequest(UserValidation.approveHost),
  UserController.approveHost
);

router.delete(
  '/:id',
  auth(Role.SUPER_ADMIN),
  UserController.deleteUser
);

export const UserRoutes = router;
