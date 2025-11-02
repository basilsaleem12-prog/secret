import { z } from 'zod'

export const createProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens and apostrophes'),
  email: z
    .string()
    .email('Invalid email address'),
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  skills: z
    .array(z.string().min(1, 'Skill cannot be empty').max(50, 'Skill name too long'))
    .min(1, 'Please add at least one skill')
    .max(20, 'Maximum 20 skills allowed'),
  interests: z
    .array(z.string().min(1, 'Interest cannot be empty').max(50, 'Interest name too long'))
    .min(1, 'Please add at least one interest')
    .max(20, 'Maximum 20 interests allowed'),
  role: z.enum(['FINDER', 'SEEKER']),
  department: z
    .string()
    .max(100, 'Department name too long')
    .optional()
    .or(z.literal('')),
  year: z
    .string()
    .max(50, 'Year too long')
    .optional()
    .or(z.literal('')),
})

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens and apostrophes')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  department: z
    .string()
    .max(100, 'Department name too long')
    .optional()
    .or(z.literal('')),
  year: z
    .string()
    .max(50, 'Year too long')
    .optional()
    .or(z.literal('')),
  skills: z
    .array(z.string().min(1).max(50))
    .max(20, 'Maximum 20 skills allowed')
    .optional(),
  interests: z
    .array(z.string().min(1).max(50))
    .max(20, 'Maximum 20 interests allowed')
    .optional(),
})

export type CreateProfileInput = z.infer<typeof createProfileSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

