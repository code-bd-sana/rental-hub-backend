import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMe(req.user!.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User profile retrieved successfully.',
    data: result
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully.',
    data: result
  });
});

const getAllHosts = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllHosts();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hosts retrieved successfully.',
    data: result
  });
});

const createAgent = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createAgent(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Agent created successfully.',
    data: result
  });
});

const createLoader = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createLoader(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Loader created successfully.',
    data: result
  });
});

const approveHost = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.approveHost(req.params.id as string, req.body.status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Host approval status updated successfully.',
    data: result
  });
});

export const UserController = {
  getMe,
  getAllUsers,
  getAllHosts,
  createAgent,
  createLoader,
  approveHost
};
