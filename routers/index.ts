// routers/index.ts
import { os } from '@orpc/server';
import { healthCheck } from './health';
// import { listPosts, createPost } from './posts';

export const appRouter = os.router({
  health: healthCheck,
  // deposit: deposit,
  // posts: os.router({    // 巢狀路由範例
  //   list: listPosts,
  //   create: createPost
  // })
});