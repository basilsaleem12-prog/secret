import { z } from 'zod'

export const createJobSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  type: z.enum(['ACADEMIC_PROJECT', 'STARTUP_COLLABORATION', 'PART_TIME_JOB', 'COMPETITION_HACKATHON']),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .trim(),
  requirements: z
    .string()
    .max(2000, 'Requirements must be less than 2000 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  duration: z
    .string()
    .max(100, 'Duration must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  compensation: z
    .string()
    .max(200, 'Compensation must be less than 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  teamSize: z
    .string()
    .max(100, 'Team size must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  tags: z
    .array(z.string().min(1).max(50, 'Tag too long'))
    .max(15, 'Maximum 15 tags allowed')
    .default([]),
  isDraft: z.boolean().default(false),
})

export const updateJobSchema = createJobSchema.partial().extend({
  id: z.string().uuid('Invalid job ID'),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>

