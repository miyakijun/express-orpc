import { z } from 'zod';
import { os } from '@orpc/server';
import { p } from '../orpc';
import Merchant from '../logic/merchant'; // 假設你的舊 Service 還在

// 1. 定義單一 Procedure (對應原本的 all 函式)
const getAll = p
  .route({
    method: 'GET',
    path: '/merchant/all', // 明確定義路徑
    summary: '取得所有商戶',
    tags: ['Merchant'],
  })
  // .input(...) // 如果有 query 參數可在這定義
  .handler(async ({ context: ctx }) => {
    // 🔥 重點：不用 try-catch，oRPC 會自動捕獲錯誤
    // 🔥 重點：不用 res.json，直接 return 資料
    // 🔥 重點：從 ctx 拿 user，而不是 req[SYMBOL]
    const result = await Merchant.all(ctx.user);
    return result;
  });

// 2. 建立這個模組的 Router (取代原本的 bind 函式)
export const merchantRouter = os.router({
  all: getAll, // 這會變成 RPC client 呼叫時的 merchant.all
});