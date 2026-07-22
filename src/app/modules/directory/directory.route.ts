import express from 'express';
import { DirectoryController } from './directory.controller';
import auth from '../../middlewares/auth';
import { fileUploadMiddleware } from '../../middlewares/fileUpload';

const router = express.Router();

router.post(
  '/',
  auth('AGENT', 'LOADER'), // Require AGENT or LOADER role
  fileUploadMiddleware.single('primaryImage'),
  DirectoryController.loadDirectory
);

router.get(
  '/',
  auth('AGENT', 'LOADER', 'SUPER_ADMIN'),
  DirectoryController.getAllDirectories
);

router.patch(
  '/:id',
  auth('AGENT', 'LOADER', 'SUPER_ADMIN'),
  fileUploadMiddleware.single('primaryImage'),
  DirectoryController.updateDirectory
);

router.delete(
  '/:id',
  auth('AGENT', 'LOADER', 'SUPER_ADMIN'),
  DirectoryController.deleteDirectory
);

export const DirectoryRoutes = router;
