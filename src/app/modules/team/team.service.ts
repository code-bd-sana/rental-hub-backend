import crypto from 'crypto';

import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import type { IAddMemberPayload, ICreateTeamPayload, IUpdateTeamPayload } from './team.interface';

const generateTeamId = (): string => {
  return `tm_${crypto.randomBytes(8).toString('hex')}`;
};

const teamSelect = {
  id: true,
  name: true,
  description: true,
  ownerId: true,
  owner: {
    select: { id: true, name: true, email: true }
  },
  members: {
    select: { id: true, name: true, email: true, role: true }
  },
  _count: {
    select: { listings: true }
  },
  createdAt: true,
  updatedAt: true
};

const createTeam = async (ownerId: string, payload: ICreateTeamPayload) => {
  // Check if user already owns a team
  const existingTeam = await prisma.team.findFirst({
    where: { ownerId }
  });

  if (existingTeam) {
    throw new AppError(409, 'You already own a team. A user can only own one team.');
  }

  const team = await prisma.team.create({
    data: {
      id: generateTeamId(),
      name: payload.name,
      description: payload.description,
      ownerId,
      members: {
        connect: { id: ownerId } // Owner is automatically a member
      }
    },
    select: teamSelect
  });

  return team;
};

const getTeamById = async (id: string) => {
  const team = await prisma.team.findUnique({
    where: { id },
    select: teamSelect
  });

  if (!team) {
    throw new AppError(404, 'Team not found.');
  }

  return team;
};

const getMyTeam = async (userId: string) => {
  // First check if user owns a team
  let team = await prisma.team.findFirst({
    where: { ownerId: userId },
    select: teamSelect
  });

  // If not owner, check if member of a team
  if (!team) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    });

    if (user?.teamId) {
      team = await prisma.team.findUnique({
        where: { id: user.teamId },
        select: teamSelect
      });
    }
  }

  if (!team) {
    throw new AppError(404, 'You are not part of any team.');
  }

  return team;
};

const updateTeam = async (teamId: string, userId: string, payload: IUpdateTeamPayload) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });

  if (!team) {
    throw new AppError(404, 'Team not found.');
  }

  if (team.ownerId !== userId) {
    throw new AppError(403, 'Only the team owner can update the team.');
  }

  const updatedTeam = await prisma.team.update({
    where: { id: teamId },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.description !== undefined && { description: payload.description })
    },
    select: teamSelect
  });

  return updatedTeam;
};

const addMember = async (teamId: string, userId: string, payload: IAddMemberPayload) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });

  if (!team) {
    throw new AppError(404, 'Team not found.');
  }

  if (team.ownerId !== userId) {
    throw new AppError(403, 'Only the team owner can add members.');
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: payload.userId }
  });

  if (!targetUser) {
    throw new AppError(404, 'User not found.');
  }

  if (targetUser.teamId) {
    throw new AppError(409, 'This user is already a member of a team.');
  }

  // Add member by updating their teamId
  await prisma.user.update({
    where: { id: payload.userId },
    data: { teamId }
  });

  return getTeamById(teamId);
};

const removeMember = async (teamId: string, ownerId: string, memberId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });

  if (!team) {
    throw new AppError(404, 'Team not found.');
  }

  if (team.ownerId !== ownerId) {
    throw new AppError(403, 'Only the team owner can remove members.');
  }

  if (team.ownerId === memberId) {
    throw new AppError(400, 'The owner cannot be removed from the team.');
  }

  // Verify the member belongs to this team
  const member = await prisma.user.findUnique({
    where: { id: memberId }
  });

  if (!member || member.teamId !== teamId) {
    throw new AppError(404, 'This user is not a member of this team.');
  }

  // Remove member by clearing their teamId
  await prisma.user.update({
    where: { id: memberId },
    data: { teamId: null }
  });

  return getTeamById(teamId);
};

export const TeamService = {
  createTeam,
  getTeamById,
  getMyTeam,
  updateTeam,
  addMember,
  removeMember
};
