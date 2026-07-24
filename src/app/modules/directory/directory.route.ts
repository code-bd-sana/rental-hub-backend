import express from 'express';
import { DirectoryController } from './directory.controller';
import auth from '../../middlewares/auth';
import { fileUploadMiddleware } from '../../middlewares/fileUpload';

import { Role } from '@prisma/client';

const router = express.Router();

router.get('/public', DirectoryController.getPublicDirectories);

router.post(
  '/',
  auth(Role.AGENT, Role.LOADER, Role.SUPER_ADMIN),
  fileUploadMiddleware.single('primaryImage'),
  DirectoryController.loadDirectory
);

router.get(
  '/',
  auth(Role.AGENT, Role.LOADER, Role.SUPER_ADMIN, Role.HOST),
  DirectoryController.getAllDirectories
);

router.patch(
  '/:id',
  auth(Role.AGENT, Role.LOADER, Role.SUPER_ADMIN),
  fileUploadMiddleware.single('primaryImage'),
  DirectoryController.updateDirectory
);

router.delete(
  '/:id',
  auth(Role.AGENT, Role.LOADER, Role.SUPER_ADMIN),
  DirectoryController.deleteDirectory
);

export const DirectoryRoutes = router;
