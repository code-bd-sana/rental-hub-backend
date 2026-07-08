import { z } from 'zod';

const createAgent = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required.' }).min(2),
    email: z.string({ message: 'Email is required.' }).email().transform(v => v.toLowerCase()),
    phone: z.string().optional(),
    password: z.string().min(8),
    permissions: z.union([z.string(), z.array(z.string()), z.record(z.any())]).optional()
  })
});

const createLoader = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required.' }).min(2),
    email: z.string({ message: 'Email is required.' }).email().transform(v => v.toLowerCase()),
    phone: z.string().optional(),
    password: z.string().min(8)
  })
});

const approveHost = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED'], { message: 'Invalid status.' })
  }).strict()
});

export const UserValidation = {
  createAgent,
  createLoader,
  approveHost
};
