import { OpenAPIHandler } from '@orpc/openapi/node';
import type { Request, Response, NextFunction } from 'express'; // 1. 引入 Express 型別
import { appRouter } from '../routers'; 
import { createContext } from './context'; 
import { legacyErrorInterceptor, traceInterceptor } from './interceptors';

const handler = new OpenAPIHandler(appRouter, {
  interceptors: [
    legacyErrorInterceptor, 
    traceInterceptor,      
  ],
});

export const orpcMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = await createContext({ req, res, next });
    const result = await handler.handle(req, res, {
      context, 
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