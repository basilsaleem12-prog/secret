import { z } from 'zod'

export const createApplicationSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  proposal: z
    .string()
    .min(50, 'Proposal must be at least 50 characters')
    .max(5000, 'Proposal must be less than 5000 characters')
    .trim(),
  resumeId: z
    .string()
    .uuid('Invalid resume ID')
    .optional(),
})

export const updateApplicationSchema = z.object({
  id: z.string().uuid('Invalid application ID'),
  status: z.enum(['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']),
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>

