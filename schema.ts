import { z } from 'zod';

export const ComponentSchemas = {
  // 健康檢查
  Health: z.object({
    status: z.string(),
    timestamp: z.date().optional(),
    version: z.string().optional(),
  }),

  // 存款回傳
  DepositResponse: z.object({
    status: z.enum(['success', 'failed', 'pending']),
    transactionId: z.string(),
    amount: z.number(),
    balance: z.number().optional(),
  }),

  // 通用錯誤
  Error: z.object({
    code: z.string(),
    message: z.string(),
  }),
};