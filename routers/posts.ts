import { z } from 'zod';
import { os } from '../common/context';
import { PostSchema, CreatePostInput } from '../common/schema';
import { PostsLogic } from '../services/posts';
const listPosts = os
  .route({
    method: 'GET',
    path: '/posts',
    summary: '取得文章列表',
    tags: ['Posts'],
  })
  .input(z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
  }))
  .output(z.array(PostSchema)) // 回傳文章陣列
  .handler(async ({ input }) => {
    return await PostsLogic.list(input);
  });

const findPost = os
  .route({
    method: 'GET',
    path: '/posts/:id', 
    summary: '取得單篇文章',
    tags: ['Posts'],
  })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .output(PostSchema)
  .handler(async ({ input }) => {
    return await PostsLogic.find(input);
  });

const createPost = os
  .route({
    method: 'POST',
    path: '/posts',
    summary: '新增文章',
    tags: ['Posts'],
  })
  .input(CreatePostInput) 
  .output(PostSchema)
  .handler(async ({ input, context }) => {
    return await PostsLogic.create(input, context.user);
  });



//   Router (路由器)
// 概念：用來把一堆 Procedure 打包成群組（資料夾）的東西。
// --- Router Export ---
export const postsRouter = os.router({
  list: listPosts,
  find: findPost,
  create: createPost,
});