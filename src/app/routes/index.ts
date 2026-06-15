import { Router } from 'express';

import { AuthRoutes } from '../modules/auth/auth.routes';
import { ListingRoutes } from '../modules/listing/listing.routes';
import { TeamRoutes } from '../modules/team/team.routes';
import { UserRoutes } from '../modules/user/user.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes
  },
  {
    path: '/users',
    route: UserRoutes
  },
  {
    path: '/teams',
    route: TeamRoutes
  },
  {
    path: '/listings',
    route: ListingRoutes
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
