import { Request, Response } from 'express';
import { TeamService } from './team.service';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';

const createTeamMember = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamService.createTeamMember(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Team member created successfully',
    data: result
  });
});

const getAllTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamService.getAllTeamMembers();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Team members retrieved successfully',
    data: result
  });
});

const updateTeamMember = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await TeamService.updateTeamMember(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Team member updated successfully',
    data: result
  });
});

const deleteTeamMember = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await TeamService.deleteTeamMember(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Team member deleted successfully',
    data: result
  });
});

export const TeamController = {
  createTeamMember,
  getAllTeamMembers,
  updateTeamMember,
  deleteTeamMember
};
