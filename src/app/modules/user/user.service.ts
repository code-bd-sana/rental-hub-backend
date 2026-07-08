import bcrypt from 'bcryptjs';
import AppError from '../../errors/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';
import prisma from '../../utils/prisma';
import config from '../../config';
import { HostApprovalStatus } from '@prisma/client';

const sanitizeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
  });
  if (!user) throw new AppError(404, 'User not found.');
  return user;
};

const getAllUsers = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(query).search(['name', 'email']).filter().sort().paginate();
  const users = await prisma.user.findMany({
    ...queryBuilder.build(),
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
  });
  const total = await prisma.user.count({ where: queryBuilder.build().where });
  return { meta: { total, page: Number(query.page) || 1, limit: Number(query.limit) || 10 }, data: users };
};

const createAgent = async (payload: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) throw new AppError(409, 'Email already exists.');

  const hashedPassword = await bcrypt.hash(payload.password, config.bcryptSaltRounds);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        password: hashedPassword,
        role: 'AGENT'
      }
    });

    await tx.agentProfile.create({
      data: {
        userId: newUser.id,
        permissions: payload.permissions ?? []
      }
    });

    return newUser;
  });

  return sanitizeUser(user);
};

const createLoader = async (payload: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) throw new AppError(409, 'Email already exists.');

  const hashedPassword = await bcrypt.hash(payload.password, config.bcryptSaltRounds);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: hashedPassword,
      role: 'LOADER'
    }
  });

  return sanitizeUser(user);
};

const approveHost = async (hostProfileId: string, status: HostApprovalStatus) => {
  const hostProfile = await prisma.hostProfile.findUnique({ where: { id: hostProfileId } });
  if (!hostProfile) throw new AppError(404, 'Host profile not found.');

  const updatedProfile = await prisma.hostProfile.update({
    where: { id: hostProfileId },
    data: { approvalStatus: status }
  });

  return updatedProfile;
};

export const UserService = {
  getMe,
  getAllUsers,
  createAgent,
  createLoader,
  approveHost
};
