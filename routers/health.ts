// routers/health.ts
import { z } from 'zod';
import { p } from '../orpc'; // 引入剛剛的心臟
// 這整坨東西 (p.route(...).handler(...)) 就是一個 "Procedure"
export const healthCheck = p
  .route({
    method: 'GET',
    path: '/health',
    summary: '健康檢查',
    tags: ['System'], // 用來在 Swagger 分類
  })
  .handler(async ({input,context}) => {
    console.log('input:', input);
    console.log('context:',context);
    
    
    // 直接回傳資料，不用包 { status: 200, body: ... }
    return { status: 'ok', timestamp: new Date() };
  });