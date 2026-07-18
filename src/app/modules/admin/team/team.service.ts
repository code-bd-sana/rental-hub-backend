import { Role, AdminPermission } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from '../../../config';
import { sendEmail } from '../../../utils/email';
import prisma from '../../../utils/prisma';

const generatePassword = (length = 8) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

const createTeamMember = async (payload: any) => {
  const { name, email, role, assignedCountries = [], permissions = [] } = payload;
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const generatedPassword = generatePassword(8);
  const hashedPassword = await bcrypt.hash(generatedPassword, Number(config.bcryptSaltRounds));

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
      }
    });

    await tx.agentProfile.create({
      data: {
        userId: user.id,
        assignedCountries,
        permissions: permissions as AdminPermission[],
      }
    });

    return user;
  });
 
  const emailContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #172554;">Welcome to Roamly!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your account has been successfully created with the role: <strong>${role}</strong>.</p>
      <p>You can log in to the platform using the following credentials:</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;">Email: <strong>${email}</strong></p>
        <p style="margin: 0;">Password: <strong>${generatedPassword}</strong></p>
      </div>
      <p><em>Please ensure you log in and change your password as soon as possible for security reasons.</em></p>
      <p>Best regards,<br>Roamly Team</p>
    </div>
  `;

  await sendEmail(email, 'Your Account Has Been Created - Roamly', emailContent);

  return newUser;
};

const getAllTeamMembers = async () => {
  return await prisma.user.findMany({
    where: {
      role: { in: ['SUPER_ADMIN', 'AGENT', 'LOADER'] }
    },
    include: {
      agentProfile: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

const updateTeamMember = async (id: string, payload: any) => {
  const { role, assignedCountries, permissions } = payload;
  
  const user = await prisma.user.findUnique({ where: { id }, include: { agentProfile: true } });
  if (!user) throw new Error('User not found');

  return await prisma.$transaction(async (tx) => {
    let updatedUser = user;
    if (role) {
      updatedUser = await tx.user.update({
        where: { id },
        data: { role: role as Role },
        include: { agentProfile: true }
      });
    }

    if (user.agentProfile && (assignedCountries !== undefined || permissions !== undefined)) {
      await tx.agentProfile.update({
        where: { id: user.agentProfile.id },
        data: {
          ...(assignedCountries && { assignedCountries }),
          ...(permissions && { permissions: permissions as AdminPermission[] })
        }
      });
    }

    return updatedUser;
  });
};

const deleteTeamMember = async (id: string) => {
  return await prisma.user.delete({ where: { id } });
};

export const TeamService = {
  createTeamMember,
  getAllTeamMembers,
  updateTeamMember,
  deleteTeamMember
};
