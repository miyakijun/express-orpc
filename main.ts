import express from 'express';
import cors from 'cors';
import { RPCHandler } from '@orpc/server/node'; // ✅ 改用這個
import { appRouter } from './routers'; // 引入剛剛打包好的 Router
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const handler = new RPCHandler(appRouter);
// 掛載 oRPC
// 所有的 API 會自動對應到 /api/health, /api/posts 等等
app.use('/api/*', async (req, res, next) => {
  // 呼叫 oRPC 處理請求
  const result = await handler.handle(req, res, {
    prefix: '/api', // 告訴 oRPC 你的路由前綴是什麼
    context: {},    // 如果有 Context (如 user info) 可以在這裡傳入
  });

  // 如果 oRPC 有處理這個請求 (matched)，就不需要 next()
  if (result.matched) {
    return;
  }

  // 沒對應到路由，交給下一個 Express 中介軟體 (通常是 404)
  next();
});

const port = 3333;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🔗 API Base URL: http://localhost:${port}/api`);
  console.log(`📄 Swagger UI available at http://localhost:${port}/docs`);
});