
import { OpenAPIHandler } from '@orpc/openapi/node';
import type { Request, Response, NextFunction } from 'express';

// 假設你的 router 定義在這裡
import { appRouter } from './router'; 
// 這是剛剛改寫過，包含 Auth 邏輯的 createContext
import { createContext } from './context'; 
// 這是之前的錯誤處理攔截器
import { legacyErrorInterceptor } from './interceptors'; 

// 1. 初始化 OpenAPI Handler
// 注意：這個物件應該是 Global 的 (Singleton)，不要放在 middleware 函式裡面
// 否則每次請求都會重新 new 一次，浪費效能
const handler = new OpenAPIHandler(appRouter, {
  interceptors: [
    legacyErrorInterceptor, 
    // 你可以在這裡加其他的 global interceptors (例如 logger)
  ],
});

// 2. 匯出 Express Middleware
export const orpcMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Step A: 建立 Context (這裡會觸發 Redis 查詢、Cookie 驗證等邏輯)
    // 如果這裡面有任何錯誤 (例如 Redis 連不上)，通常會直接拋出 Error
    const context = await createContext({ req, res, next });

    // Step B: 交給 oRPC 處理
    const result = await handler.handle(req, res, {
      prefix: '/api', // 👈 重要：如果你的 API 網址都是 /api 開頭，請設定這個
      context,        // 注入剛剛產生好的 Context (內含 user)
    });

    // Step C: 判斷是否命中路由
    if (result.matched) {
      // 如果 oRPC 處理了這個請求 (matched: true)，表示回應已經送出去了
      // 這裡直接 return 結束函式，不要再 call next()
      return;
    }

    // Step D: 沒命中路由 (404)
    // 如果網址是 /api/unknown，oRPC 說我不認識
    // 就呼叫 next() 讓 Express 繼續往下找 (例如交給原本的 404 handler)
    next();
    
  } catch (error) {
    // 如果 createContext 發生預期外的錯誤，交給 Express 的 Global Error Handler
    next(error);
  }
};