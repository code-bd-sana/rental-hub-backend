import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthService } from './auth.service';
import { fileUploadService } from '../../utils/FileUploadService';

const registerGuest = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerGuest(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Guest registered successfully.',
    data: result
  });
});

const registerHost = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const documentUrls: { type: string; url: string }[] = [];

  if (files && files.length > 0) {
    for (const file of files) {
      const savedUrl = await fileUploadService.uploadFile(file, 'hosts/documents');
      documentUrls.push({
        type: 'OTHER', // Default to OTHER since frontend doesn't categorize them yet
        url: savedUrl
      });
    }
  }

  const result = await AuthService.registerHost(req.body, documentUrls);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Host registered successfully.',
    data: result
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  res.cookie('refreshToken', result.refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'none'
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully.',
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.refreshToken(req.cookies.refreshToken);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Token refreshed successfully.',
    data: result
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.changePassword(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully.',
    data: null
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset code sent successfully.',
    data: null
  });
});

const verifyResetCode = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyResetCode(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reset code verified successfully.',
    data: result
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset successfully.',
    data: null
  });
});

export const AuthController = {
  registerGuest,
  registerHost,
  login,
  refreshToken,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword
};
