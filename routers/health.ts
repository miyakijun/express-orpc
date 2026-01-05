
import { os } from '../common/context'; 
export const healthCheck = os
  .route({
    method: 'GET',
    path: '/health',
    summary: '健康檢查',
    tags: ['System'], // 用來在 Swagger 分類
  })
  .handler(async ({input,context}) => {
    console.log(context.req.query)
    console.log('input:', input);
    console.log('context:',context.user);
    
    
    // 直接回傳資料，不用包 { status: 200, body: ... }
    return { status: 'ok', timestamp: new Date() };
  });