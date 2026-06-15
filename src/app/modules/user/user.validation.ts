import { z } from 'zod';

const changeRole = z.object({
  body: z
    .object({
      role: z.enum(['GUEST', 'HOST', 'ADMIN'], {
        message: 'Invalid role. Must be GUEST, HOST, or ADMIN.'
      })
    })
    .strict()
});

export const UserValidation = {
  changeRole
};
