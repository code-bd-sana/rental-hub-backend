import type { RequestHandler } from 'express';

import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TeamService } from './team.service';

const createTeam: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  const result = await TeamService.createTeam(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Team created successfully.',
    data: result
  });
});

const getTeamById: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TeamService.getTeamById(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Team retrieved successfully.',
    data: result
  });
});

const getMyTeam: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  const result = await TeamService.getMyTeam(req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your team retrieved successfully.',
    data: result
  });
});

const updateTeam: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  const { id } = req.params;
  const result = await TeamService.updateTeam(id as string, req.user.userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Team updated successfully.',
    data: result
  });
});

const addMember: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  const { id } = req.params;
  const result = await TeamService.addMember(id as string, req.user.userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Member added successfully.',
    data: result
  });
});

const removeMember: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  const { id, userId } = req.params;
  const result = await TeamService.removeMember(id as string, req.user.userId, userId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Member removed successfully.',
    data: result
  });
});

export const TeamController = {
  createTeam,
  getTeamById,
  getMyTeam,
  updateTeam,
  addMember,
  removeMember
};
