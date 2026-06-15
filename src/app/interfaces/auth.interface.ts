export type UserRole = 'GUEST' | 'HOST' | 'ADMIN';

export interface IAuthUser {
  userId: string;
  email: string;
  role: UserRole;
}
