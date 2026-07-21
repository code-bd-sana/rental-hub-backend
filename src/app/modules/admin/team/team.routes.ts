import { Role } from '@prisma/client';
import express from 'express';
import { TeamController } from './team.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { TeamValidation } from './team.validation';
import auth from '../../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  auth(Role.SUPER_ADMIN),
  validateRequest(TeamValidation.createTeamMemberSchema),
  TeamController.createTeamMember
);

router.get(
  '/',
  auth(Role.SUPER_ADMIN),
  TeamController.getAllTeamMembers
);

router.patch(
  '/:id',
  auth(Role.SUPER_ADMIN),
  validateRequest(TeamValidation.updateTeamMemberSchema),
  TeamController.updateTeamMember
);

router.delete(
  '/:id',
  auth(Role.SUPER_ADMIN),
  TeamController.deleteTeamMember
);

export const TeamRoutes = router;
