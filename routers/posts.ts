import { z } from 'zod';
import { os } from '@orpc/server';
import { p } from '../orpc'; 

// --- Schemas (也可以放在 schemas.ts 共用) ---
const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.number(),
  createdAt: z.date(),
});

const CreatePostInput = z.object({
  title: z.string().min(1, '標題不能為空'),
  content: z.string(),
});

// --- Procedures ---

// 1. 取得文章列表 (GET /posts?limit=10&page=1)
const listPosts = p
  .route({
    method: 'GET',
    path: '/posts',
    summary: '取得文章列表',
    tags: ['Posts'],
  })
  .input(CreatePostInput)
  .output(z.array(PostSchema)) // 回傳文章陣列
  .handler(async ({ input, context }) => {
    // 這裡可以直接拿到型別安全的 input.limit 和 input.page
    console.log(`Fetching posts: page ${input.page}, limit ${input.limit}`);

    // 模擬資料庫查詢
    return [
      {
        id: '1',
        title: 'Hello oRPC',
        content: 'This is awesome',
        authorId: 1,
        createdAt: new Date(),
      },
    ];
  });

// 2. 取得單篇文章 (GET /posts/:id)
const findPost = p
  .route({
    method: 'GET',
    path: '/posts/:id', // :id 對應 input 裡的 id
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
    // 模擬找不到的情況 (oRPC 會自動處理錯誤拋出)
    if (input.id === '999') {
      throw new Error('Post not found'); 
      // 或者使用更進階的 os.error (如果有的話)
    }

    return {
      id: input.id,
      title: 'Found Post',
      content: 'Content here...',
      authorId: 1,
      createdAt: new Date(),
    };
  });

// 3. 新增文章 (POST /posts)
const createPost = p
  .route({
    method: 'POST',
    path: '/posts',
    summary: '新增文章',
    tags: ['Posts'],
  })
  .input(CreatePostInput) // 這裡的 input 會自動對應到 Body
  .output(PostSchema)
  .handler(async ({ input, context }) => {
    console.log('input:', input);
    console.log('context:',context);
    const authorId = context.user?.id || 0;
    console.log(`User ${authorId} creating post: ${input.title}`);
    // 模擬寫入資料庫
    return {
      id: 'new-id-123',
      title: input.title,
      content: input.content,
      authorId: authorId,
      createdAt: new Date(),
    };
  });


//   Router (路由器)
// 概念：用來把一堆 Procedure 打包成群組（資料夾）的東西。
// --- Router Export ---
export const postsRouter = os.router({
  list: listPosts,
  find: findPost,
  create: createPost,
});