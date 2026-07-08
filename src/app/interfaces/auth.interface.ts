import { Role } from '@prisma/client';

export type UserRole = Role;

export interface IAuthUser {
  userId: string;
  email: string;
  role: UserRole;
}
