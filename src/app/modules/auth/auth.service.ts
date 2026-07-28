import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/email';
import prisma from '../../utils/prisma';
import type { UserRole } from '../../interfaces/auth.interface';
import { HostType } from '@prisma/client';

const sanitizeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

const registerGuest = async (payload: any) => {
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
        role: 'GUEST'
      }
    });

    await tx.guestProfile.create({
      data: {
        userId: newUser.id,
        countriesToVisit: payload.countriesToVisit ?? [],
        interests: payload.interests,
        allergies: payload.allergies,
        extraText: payload.extraText,
        subscriptionStatus: payload.subscriptionStatus ?? false
      }
    });

    return newUser;
  });

  return sanitizeUser(user);
};

// registerHost handles files logic mapped by the controller, 
// here we receive the cleaned payload + document URLs
const registerHost = async (payload: any, documentUrls: { type: string, url: string }[]) => {
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
        role: 'HOST'
      }
    });

    const hostProfile = await tx.hostProfile.create({
      data: {
        userId: newUser.id,
        hostTypes: payload.hostTypes ?? [],
        businessName: payload.businessName,
        location: payload.location,
        address: payload.address,
        country: payload.country,
        city: payload.city,
        state: payload.state,
        registrationNumber: payload.registrationNumber,
        description: payload.description,
        approvalStatus: 'PENDING'
      }
    });

    if (documentUrls.length > 0) {
      await tx.hostDocument.createMany({
        data: documentUrls.map(doc => ({
          hostId: hostProfile.id,
          documentType: doc.type as any,
          fileUrl: doc.url
        }))
      });
    }

    return newUser;
  });

  return sanitizeUser(user);
};

const login = async (payload: any) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) throw new AppError(401, 'Invalid email or password.');

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatched) throw new AppError(401, 'Invalid email or password.');

  if (user.role === 'HOST') {
    const hostProfile = await prisma.hostProfile.findUnique({ where: { userId: user.id } });
    if (hostProfile?.approvalStatus === 'SUSPENDED') {
      throw new AppError(403, 'Your account has been suspended by an administrator.');
    }
  }

  const authPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(authPayload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn });
  const refreshToken = jwt.sign(authPayload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

  let permissions: string[] = [];
  if (user.role === 'AGENT' || user.role === 'LOADER') {
    const agentProfile = await prisma.agentProfile.findUnique({ where: { userId: user.id } });
    if (agentProfile) {
      permissions = agentProfile.permissions;
    }
  }

  let subscriptionStatus = false;
  if (user.role === 'GUEST') {
    const guestProfile = await prisma.guestProfile.findUnique({ where: { userId: user.id } });
    if (guestProfile) {
      subscriptionStatus = guestProfile.subscriptionStatus;
    }
  }

  return { accessToken, refreshToken, user: { ...sanitizeUser(user), permissions, subscriptionStatus } };
};

const refreshToken = async (token: string) => {
  let decoded: any;
  try {
    decoded = jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    throw new AppError(401, 'Invalid or expired refresh token.');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new AppError(404, 'User does not exist.');

  const authPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(authPayload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn });
  return { accessToken };
};

const changePassword = async (userId: string, payload: any) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found.');

  const isPasswordMatched = await bcrypt.compare(payload.oldPassword, user.password);
  if (!isPasswordMatched) throw new AppError(403, 'Old password does not match.');

  const newHashedPassword = await bcrypt.hash(payload.newPassword, config.bcryptSaltRounds);
  await prisma.user.update({ where: { id: userId }, data: { password: newHashedPassword } });
};

const forgotPassword = async (payload: any) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) return;

  const resetCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const hashedResetCode = await bcrypt.hash(resetCode, config.bcryptSaltRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetCode: hashedResetCode, passwordResetExpires: expiresAt }
  });

  const emailHtml = `<h1>Password Reset</h1><p>Code: <strong>${resetCode}</strong></p>`;
  await sendEmail(user.email, 'Password Reset Code', emailHtml);
};

const verifyResetCode = async (payload: any) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user || !user.passwordResetCode || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new AppError(400, 'Invalid or expired reset code.');
  }

  const isCodeValid = await bcrypt.compare(payload.code, user.passwordResetCode);
  if (!isCodeValid) throw new AppError(400, 'Invalid or expired reset code.');

  const secret = config.jwt.resetSecret + user.password;
  const resetToken = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: config.jwt.resetExpiresIn });
  return { resetToken };
};

const resetPassword = async (payload: any) => {
  const decoded = jwt.decode(payload.token) as { userId?: string; email?: string } | null;
  if (!decoded || !decoded.userId) throw new AppError(400, 'Invalid token.');

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new AppError(400, 'Invalid token.');

  const secret = config.jwt.resetSecret + user.password;
  try {
    jwt.verify(payload.token, secret);
  } catch (error) {
    throw new AppError(400, 'Invalid or expired token.');
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, config.bcryptSaltRounds);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, passwordResetCode: null, passwordResetExpires: null }
  });
};

export const AuthService = {
  registerGuest,
  registerHost,
  login,
  refreshToken,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword
};
