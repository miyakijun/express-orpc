// import { os } from '@orpc/server';
import { healthCheck } from './health';

// export const appRouter = os.router({
//   health: healthCheck,

// });


import { os } from '@orpc/server';
import { merchantRouter } from './merchant';
import { postsRouter } from './posts';
// import { authRouter } from './authentication'; // 假設你也改好了

export const appRouter = os.router({
  // 這裡的 key (例如 'merchant') 主要是給內部 RPC Client 用的結構
  // 實際的 URL 路徑是看你在 merchant.ts 裡定義的 path
  posts: postsRouter,
  merchant: merchantRouter,
  health: healthCheck,
  // auth: authRouter,
  // platform: platformRouter,
  // ... 把其他的都加進來
});