import { z } from 'zod';

const createTeam = z.object({
  body: z
    .object({
      name: z
        .string({ message: 'Team name is required.' })
        .min(2, 'Team name must be at least 2 characters long.')
        .max(100, 'Team name must not exceed 100 characters.'),
      description: z
        .string()
        .max(500, 'Description must not exceed 500 characters.')
        .optional()
    })
    .strict()
});

const updateTeam = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, 'Team name must be at least 2 characters long.')
        .max(100, 'Team name must not exceed 100 characters.')
        .optional(),
      description: z
        .string()
        .max(500, 'Description must not exceed 500 characters.')
        .optional()
    })
    .strict()
});

const addMember = z.object({
  body: z
    .object({
      userId: z.string({ message: 'User ID is required.' }).uuid('User ID must be a valid UUID.')
    })
    .strict()
});

export const TeamValidation = {
  createTeam,
  updateTeam,
  addMember
};
