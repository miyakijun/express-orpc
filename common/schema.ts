import { z } from 'zod';

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.number(),
  createdAt: z.date(),
});


export const CreatePostInput = z.object({
  title: z.string().min(1, '標題不能為空'),
  content: z.string(),
});

export const ComponentSchemas = {
  Health: z.object({
    status: z.string(),
    timestamp: z.date().optional(),
    version: z.string().optional(),
  }),

  DepositResponse: z.object({
    status: z.enum(['success', 'failed', 'pending']),
    transactionId: z.string(),
    amount: z.number(),
    balance: z.number().optional(),
  }),

  Error: z.object({
    code: z.string(),
    message: z.string(),
  }),
};
