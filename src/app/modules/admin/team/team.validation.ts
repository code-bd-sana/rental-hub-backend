import { z } from 'zod';
import { AdminPermission, Role } from '@prisma/client';

export const TeamRoles = [Role.SUPER_ADMIN, Role.AGENT, Role.LOADER] as const;

const createTeamMemberSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.enum(TeamRoles),
    assignedCountries: z.array(z.string()).optional(),
    permissions: z.array(z.nativeEnum(AdminPermission)).optional()
  })
});

const updateTeamMemberSchema = z.object({
  body: z.object({
    role: z.enum(TeamRoles).optional(),
    assignedCountries: z.array(z.string()).optional(),
    permissions: z.array(z.nativeEnum(AdminPermission)).optional()
  })
});

export const TeamValidation = {
  createTeamMemberSchema,
  updateTeamMemberSchema
};
