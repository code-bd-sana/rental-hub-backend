import { z } from 'zod';
import { HostType } from '@prisma/client';

const registerGuest = z.object({
  body: z
    .object({
      name: z.string({ message: 'Name is required.' }).min(2, 'Name must be at least 2 characters long.'),
      email: z
        .string({ message: 'Email is required.' })
        .trim()
        .email('Email must be a valid email address.')
        .transform((value) => value.toLowerCase()),
      phone: z.string().optional(),
      password: z
        .string({ message: 'Password is required.' })
        .min(8, 'Password must be at least 8 characters long.'),
      confirmPassword: z.string({ message: 'Confirm password is required.' }),
      // Guest profile specific fields
      countriesToVisit: z.array(z.string()).optional(),
      interests: z.string().optional(),
      allergies: z.string().optional(),
      extraText: z.string().optional(),
      subscriptionStatus: z.boolean().optional().default(false)
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword']
    })
});

// Since host registration is multipart/form-data, fields might come as strings.
// We'll coerce arrays where necessary.
const registerHost = z.object({
  body: z
    .object({
      name: z.string({ message: 'Name is required.' }).min(2),
      email: z.string({ message: 'Email is required.' }).email().transform(v => v.toLowerCase()),
      phone: z.string({ message: 'Phone is required for hosts.' }),
      password: z.string().min(8),
      
      // Host profile fields (optional to allow saving as PENDING)
      hostTypes: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .transform((val) => {
          if (!val) return [];
          if (typeof val === 'string') {
            try {
              const parsed = JSON.parse(val);
              return Array.isArray(parsed) ? parsed : [val];
            } catch {
              return [val];
            }
          }
          return val;
        }),
      businessName: z.string().optional(),
      location: z.string().optional(),
      address: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      registrationNumber: z.string().optional(),
      description: z.string().optional()
    })
});

const login = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required.' }).trim().email().transform(v => v.toLowerCase()),
    password: z.string({ message: 'Password is required.' })
  }).strict()
});

const changePassword = z.object({
  body: z.object({
    oldPassword: z.string({ message: 'Old password is required.' }),
    newPassword: z.string({ message: 'New password is required.' }).min(8)
  }).strict()
});

const forgotPassword = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required.' }).trim().email().transform(v => v.toLowerCase())
  }).strict()
});

const verifyResetCode = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required.' }).trim().email().transform(v => v.toLowerCase()),
    code: z.string({ message: 'Reset code is required.' }).length(6)
  }).strict()
});

const resetPassword = z.object({
  body: z.object({
    token: z.string({ message: 'Reset token is required.' }),
    newPassword: z.string({ message: 'New password is required.' }).min(8)
  }).strict()
});

const refreshToken = z.object({
  cookies: z.object({
    refreshToken: z.string({ message: 'Refresh token is required.' })
  })
});

export const AuthValidation = {
  registerGuest,
  registerHost,
  login,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  refreshToken
};
