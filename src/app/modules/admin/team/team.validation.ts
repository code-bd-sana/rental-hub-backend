import { z } from 'zod';

const createTeamMemberSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['SUPER_ADMIN', 'AGENT', 'LOADER']),
    assignedCountries: z.array(z.string()).optional(),
    permissions: z.array(z.enum(['LOAD_DIRECTORY', 'APPROVE_CLAIMS', 'MANAGE_GUESTS', 'MANAGE_TEAM', 'VIEW_REVENUE'])).optional()
  })
});

const updateTeamMemberSchema = z.object({
  body: z.object({
    role: z.enum(['SUPER_ADMIN', 'AGENT', 'LOADER']).optional(),
    assignedCountries: z.array(z.string()).optional(),
    permissions: z.array(z.enum(['LOAD_DIRECTORY', 'APPROVE_CLAIMS', 'MANAGE_GUESTS', 'MANAGE_TEAM', 'VIEW_REVENUE'])).optional()
  })
});

export const TeamValidation = {
  createTeamMemberSchema,
  updateTeamMemberSchema
};
