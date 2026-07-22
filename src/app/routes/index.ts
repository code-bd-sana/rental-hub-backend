import { Router } from 'express';

import { AuthRoutes } from '../modules/auth/auth.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { ListingRoutes } from '../modules/listing/listing.routes';
import { UploadRoutes } from '../modules/upload/upload.routes';
import { BookingRoutes } from '../modules/booking/booking.routes';
import { CountryRoutes } from '../modules/country/country.routes';
import { TeamRoutes } from '../modules/admin/team/team.routes';
import { DirectoryRoutes } from '../modules/directory/directory.route';

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
    path: '/listings',
    route: ListingRoutes
  },
  {
    path: '/uploads',
    route: UploadRoutes
  },
  {
    path: '/bookings',
    route: BookingRoutes
  },
  {
    path: '/countries',
    route: CountryRoutes
  },
  {
    path: '/admin/team',
    route: TeamRoutes
  },
  {
    path: '/directory',
    route: DirectoryRoutes
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
