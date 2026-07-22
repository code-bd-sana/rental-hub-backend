import { z } from 'zod';

const loadDirectorySchema = z.object({
  body: z.object({
    country: z.string().min(1, 'Country is required'),
    businessName: z.string().min(1, 'Business name is required'),
    businessNumber: z.string().min(1, 'Business number is required'),
    address: z.string().min(1, 'Address is required')
  })
});

export const DirectoryValidation = {
  loadDirectorySchema
};
