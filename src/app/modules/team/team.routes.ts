import { Router } from 'express';

import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TeamController } from './team.controller';
import { TeamValidation } from './team.validation';

const router = Router();

router.post(
  '/',
  auth('HOST', 'ADMIN'),
  validateRequest(TeamValidation.createTeam),
  TeamController.createTeam
);

router.get('/my-team', auth('HOST', 'ADMIN'), TeamController.getMyTeam);

router.get('/:id', auth('HOST', 'ADMIN'), TeamController.getTeamById);

router.patch(
  '/:id',
  auth('HOST', 'ADMIN'),
  validateRequest(TeamValidation.updateTeam),
  TeamController.updateTeam
);

router.post(
  '/:id/members',
  auth('HOST', 'ADMIN'),
  validateRequest(TeamValidation.addMember),
  TeamController.addMember
);

router.delete(
  '/:id/members/:userId',
  auth('HOST', 'ADMIN'),
  TeamController.removeMember
);

export const TeamRoutes = router;
