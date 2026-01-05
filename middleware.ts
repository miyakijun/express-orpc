import { OpenAPIHandler } from '@orpc/openapi/node';
import type { Request, Response, NextFunction } from 'express'; // 1. 引入 Express 型別

// 👇 2. 引入你的 Router (請確認檔案路徑)
import { appRouter } from './routers'; 

// 👇 3. 引入我們剛剛寫好的 Context 工廠 (解決 Cannot find name 'createContext')
import { createContext } from './context'; 

// 👇 4. 引入你的 Interceptors
import { legacyErrorInterceptor, traceInterceptor } from './interceptors';

// 👇 5. 初始化 Handler (解決 Cannot find name 'handler')
// 必須放在 Middleware 外面，避免每次 Request 都重新建立
const handler = new OpenAPIHandler(appRouter, {
  interceptors: [
    legacyErrorInterceptor, // 處理錯誤格式
    traceInterceptor,       // 處理 Log
  ],
});

// 👇 6. 加上型別註記 (解決 Parameter 'req' implicitly has an 'any' type)
export const orpcMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Step A: 建立 Context (IP 檢查、Cookie 解析都在這裡發生)
    const context = await createContext({ req, res, next });

    // Step B: 交給 oRPC 處理
    const result = await handler.handle(req, res, {
      prefix: '/api', // 👈 請確保這跟 main.ts 裡的 app.use('/api', ...) 一致
      context,        // 注入 Context
    });

    // Step C: 判斷是否命中路由
    if (result.matched) {
      return; // oRPC 處理掉了，結束
    }

    // Step D: 沒命中，交給下一個 Express Middleware (例如 404)
    next();
    
  } catch (error) {
    // Step E: 如果 createContext 噴錯 (例如 IP 被鎖)，這裡會接住並交給 Express
    next(error);
  }
};