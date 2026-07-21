import { Role } from '@prisma/client';
import express from 'express';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { uploadToS3 } from '../../utils/s3.utils';
import auth from '../../middlewares/auth';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  '/image',
  auth(Role.HOST, Role.SUPER_ADMIN),
  upload.single('image'),
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const fileUrl = await uploadToS3(req.file.buffer, req.file.mimetype, req.file.originalname);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Image uploaded successfully',
      data: { url: fileUrl },
    });
  })
);

export const UploadRoutes = router;
