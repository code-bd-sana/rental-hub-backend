import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { fileUploadService } from '../../utils/FileUploadService';
import sendResponse from '../../utils/sendResponse';
import { DirectoryService } from './directory.service';

const loadDirectory = catchAsync(async (req: Request, res: Response) => {
  const { country, businessName, businessNumber, address } = req.body;
  const file = req.file;

  if (!file) {
    throw new Error('Primary business image is required');
  }

  // Upload the file
  const primaryImage = await fileUploadService.uploadFile(file, 'directory/images');

  const payload = {
    country,
    businessName,
    businessNumber,
    address,
    primaryImage,
    loadedById: req.user!.userId // Assumes auth middleware sets req.user
  };

  const result = await DirectoryService.loadDirectory(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Directory loaded successfully',
    data: result
  });
});

const getAllDirectories = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.query;
  const result = await DirectoryService.getAllDirectories(status as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Directories fetched successfully',
    data: result
  });
});

const updateDirectory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  if (req.file) {
    payload.primaryImage = await fileUploadService.uploadFile(req.file, 'directory/images');
  }

  const result = await DirectoryService.updateDirectory(id as string, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Directory updated successfully',
    data: result
  });
});

const deleteDirectory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DirectoryService.deleteDirectory(id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Directory deleted successfully',
    data: result
  });
});

export const DirectoryController = {
  loadDirectory,
  getAllDirectories,
  updateDirectory,
  deleteDirectory
};
