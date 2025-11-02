import { z } from 'zod'

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID'),
  jobId: z.string().uuid('Invalid job ID').optional(),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters')
    .trim(),
})

export const createConversationSchema = z.object({
  participantId: z.string().uuid('Invalid participant ID'),
  jobId: z.string().uuid('Invalid job ID').optional(),
  initialMessage: z
    .string()
    .min(1, 'Initial message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters')
    .trim()
    .optional(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type CreateConversationInput = z.infer<typeof createConversationSchema>

